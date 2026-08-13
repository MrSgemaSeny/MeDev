Контекст поднят. Вижу MeDev — платформа портфолио + генератор резюме для разработчиков. Теперь читаю репозиторий.Достаточно данных для полного аудита. Пишу отчёт.Теперь у меня полная картина. Пишу финальный отчёт.

---

# Security Audit: MeDev — Полный отчёт

Структура: сначала критика, потом фиксы с кодом. Всё по приоритету Security > Correctness > остальное.

---

## [CRITICAL] #1 — SSRF: произвольный URL-scraping без валидации

**Файл:** `tracker/controller/JobApplicationController.java` → `GET /v1/tracker/applications/scrape?url=...`

```java
@GetMapping("/scrape")
public CreateJobApplicationRequest scrape(@RequestParam String url) {
    return scraperService.scrapeJobUrl(url); // url — любая строка от пользователя
}
```

`Jsoup.connect(url).get()` — подключается к **любому** хосту, включая:
- `http://169.254.169.254/latest/meta-data/` — AWS/Fly.io instance metadata (ключи, env-переменные)
- `http://localhost:6379` — Redis без пароля (в dev)
- `http://internal-service/admin`

Это классический SSRF. Аутентификация стоит, но любой залогиненный FREE-пользователь может это сделать.

**Фикс — белый список хостов:**

```java
// tracker/service/WebScraperService.java
private static final Set<String> ALLOWED_HOSTS = Set.of(
    "hh.kz", "hh.ru", "linkedin.com", "www.linkedin.com",
    "indeed.com", "www.indeed.com", "career.habr.com"
);

public CreateJobApplicationRequest scrapeJobUrl(String url) {
    validateUrl(url); // бросает исключение если хост не в списке
    // ...остальной код
}

private void validateUrl(String url) {
    try {
        URI uri = new URI(url);
        String scheme = uri.getScheme();
        String host = uri.getHost();
        
        if (!"https".equalsIgnoreCase(scheme)) {
            throw new IllegalArgumentException("Only HTTPS URLs are allowed");
        }
        if (host == null || !ALLOWED_HOSTS.contains(host.toLowerCase())) {
            throw new IllegalArgumentException("URL host is not allowed: " + host);
        }
        // Защита от DNS rebinding — явно запрещаем localhost и приватные диапазоны
        InetAddress addr = InetAddress.getByName(host);
        if (addr.isLoopbackAddress() || addr.isSiteLocalAddress() || addr.isLinkLocalAddress()) {
            throw new IllegalArgumentException("Private/loopback addresses are not allowed");
        }
    } catch (URISyntaxException | UnknownHostException e) {
        throw new IllegalArgumentException("Invalid URL format");
    }
}
```

---

## [CRITICAL] #2 — Kaspi webhook: верификация подписи — заглушка

**Файл:** `KaspiPayService.java`

```java
private boolean verifySignature(Map<String, Object> payload, String signature) {
    if (signature == null || signature.isBlank()) return false;
    // Для шаблона мы принимаем любую подпись, если она не пустая.
    return true; // ← любой злоумышленник с непустым X-Kaspi-Signature получает PRO-план
}
```

Любой POST на `/v1/billing/webhook/kaspi` с телом `{"orderId":"42_12","status":"COMPLETED"}` и любым непустым хедером `X-Kaspi-Signature: x` → апгрейд произвольного userId до PRO.

**Фикс — реальный HMAC:**

```java
@Value("${kaspi.secret-key}")
private String secretKey;

private boolean verifySignature(Map<String, Object> payload, String signature) {
    if (signature == null || signature.isBlank()) return false;
    try {
        String payloadStr = objectMapper.writeValueAsString(payload);
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String expected = HexFormat.of().formatHex(mac.doFinal(payloadStr.getBytes(StandardCharsets.UTF_8)));
        // constant-time comparison — защита от timing attacks
        return MessageDigest.isEqual(expected.getBytes(), signature.getBytes());
    } catch (Exception e) {
        log.error("Kaspi signature verification error", e);
        return false;
    }
}
```

Пока Kaspi API не подключён — **закрой этот эндпоинт полностью** (`@Profile("!kaspi")` или return 404).

---

## [CRITICAL] #3 — AES/ECB шифрование GitHub токенов

**Файл:** `EncryptionUtils.java`

```java
Cipher cipher = Cipher.getInstance("AES"); // ECB mode по умолчанию!
```

AES без явного mode — JVM берёт ECB. ECB детерминированный: одинаковый plaintext → одинаковый ciphertext. Для токенов это означает, что одинаковые токены видны по совпадающим зашифрованным значениям в БД, а также ECB не имеет семантической безопасности.

**Фикс — AES-GCM:**

```java
private static final String ALGORITHM = "AES/GCM/NoPadding";
private static final int GCM_IV_LENGTH = 12;
private static final int GCM_TAG_LENGTH = 128;

public static String encrypt(String value) {
    if (value == null || key == null) return value;
    try {
        byte[] iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv);
        
        GCMParameterSpec paramSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), paramSpec);
        byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
        
        // Формат: base64(iv + ciphertext)
        byte[] combined = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
        return Base64.getEncoder().encodeToString(combined);
    } catch (Exception e) {
        throw new RuntimeException("Encryption failed", e);
    }
}

public static String decrypt(String value) {
    if (value == null || key == null) return value;
    try {
        byte[] combined = Base64.getDecoder().decode(value);
        byte[] iv = Arrays.copyOfRange(combined, 0, GCM_IV_LENGTH);
        byte[] ciphertext = Arrays.copyOfRange(combined, GCM_IV_LENGTH, combined.length);
        
        GCMParameterSpec paramSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), paramSpec);
        return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
    } catch (Exception e) {
        // fallback для миграции старых ECB-значений
        return decryptLegacyEcb(value);
    }
}
```

После деплоя нужна миграция: перешифровать все github_access_token в БД.

---

## [CRITICAL] #4 — Actuator `/actuator/health` в prod: `show-details: always` без авторизации

**Файл:** `application-prod.yml`

```yaml
management:
  endpoint:
    health:
      show-details: always   # ← открыт анонимам!
```

В SecurityConfig в `permitAll()` стоит `/actuator/health`. Вместе с `show-details: always` анонимный запрос вернёт детали о БД, Redis, disk space — разведывательная информация для атакующего.

**Фикс:**

```yaml
# application-prod.yml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized   # детали — только авторизованным
```

```java
// SecurityConfig.java — разграничить health vs metrics/prometheus
.requestMatchers("/actuator/health").permitAll()  // только ping
.requestMatchers("/actuator/**").hasRole("ADMIN") // всё остальное — только admin
```

---

## [CRITICAL] #5 — RateLimitFilter: X-Forwarded-For spoofing (дублирующий баг)

**Файл:** `config/RateLimitFilter.java`

```java
private String getClientIpAddress(HttpServletRequest request) {
    String xForwardedForHeader = request.getHeader("X-Forwarded-For");
    if (xForwardedForHeader == null) {
        return request.getRemoteAddr();
    }
    return xForwardedForHeader.split(",")[0]; // ← пользователь контролирует этот хедер
}
```

При этом в `AuthController.getClientIp()` комментарий правильный — там используется `getRemoteAddr()`. Но `RateLimitFilter` читает `X-Forwarded-For` напрямую. Атакующий ставит `X-Forwarded-For: 1.2.3.4` и обходит rate limit на `/v1/auth/login`.

У тебя **два разных rate limiter на login**: `RateLimitFilter` (5 req/min) и `AuthRateLimiter` (20 req/min). `AuthRateLimiter` защищён правильно, `RateLimitFilter` — нет. Убери `RateLimitFilter` вообще — он дублирует `AuthRateLimiter` и делает это небезопасно:

```java
// RateLimitFilter.java — удалить или оставить только без X-Forwarded-For:
private String getClientIpAddress(HttpServletRequest request) {
    // Только remoteAddr — Spring уже обрабатывает X-Forwarded-For через ForwardedHeaderFilter
    return request.getRemoteAddr();
}
```

---

## [WARNING] #6 — Stripe webhook: эндпоинт требует авторизации JWT

**Файл:** `SecurityConfig.java`

`/v1/billing/webhook` не в `permitAll()`. Значит Stripe не сможет вызвать его (у Stripe нет JWT). Либо это уже сломано и webhook не работает, либо ты обошёл это как-то. Нужно добавить:

```java
.requestMatchers("/v1/billing/webhook").permitAll()  // Stripe webhook — без JWT
// Безопасность обеспечивает verifySignature() внутри сервиса
```

Но при этом **Stripe webhook уже правильно верифицирует подпись** — `Webhook.constructEvent(payload, sigHeader, webhookSecret)`. Так что открыть публично безопасно.

---

## [WARNING] #7 — frontend axios.ts: hardcoded localhost в prod

**Файл:** `frontend/src/shared/api/axios.ts`

```typescript
export const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // ← в prod это сломано
});
// ...
const { data } = await axios.post('http://localhost:8080/api/v1/auth/refresh', ...);
```

Два места с localhost. В `vite.config.ts` нет `VITE_API_URL` — значит в деплое это либо сломано, либо там proxy.

**Фикс:**

```typescript
// vite.config.ts — добавить переменную
// frontend/.env.production
VITE_API_URL=https://api.medev.app/api/v1

// axios.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// и в refresh interceptor:
await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
```

---

## [WARNING] #8 — Нет лимита на размер jobDescription в AI-запросах

**Файл:** `AiApplicationRequest.java`

```java
@NotBlank(message = "Job description is required")
private String jobDescription; // нет @Size(max = ...)
```

Пользователь может послать 10MB текста → раздутый промпт → дорогостоящий Groq запрос. При этом в `/v1/ai/chat/stream` есть `sanitize()` с обрезкой до 2000 символов, но в cover letter / tailor — нет.

```java
@NotBlank
@Size(max = 8000, message = "Job description must not exceed 8000 characters")
private String jobDescription;

@Size(max = 200)
private String targetRole;
```

---

## [WARNING] #9 — AdminController возвращает User entity напрямую (data leak)

**Файл:** `AdminController.java`

```java
@GetMapping("/users")
public ResponseEntity<Page<User>> getUsers(...) {
    return ResponseEntity.ok(adminService.getAllUsers(PageRequest.of(page, size)));
}
```

`User` entity содержит `stripeCustomerId`, `kaspiCustomerId`, `githubId`, и хотя `password` в теории null для OAuth — это нарушение принципа минимального раскрытия. Нужен отдельный `AdminUserDto` без payment-идентификаторов (они и так в БД, не в JSON, но лучше явно контролировать что выходит).

---

## [WARNING] #10 — AiRateLimiter в памяти: делает DB-запрос на каждый вызов

**Файл:** `AiRateLimiter.java`

```java
private int getUserDailyLimit(Long userId) {
    return userRepository.findById(userId)  // SELECT * FROM users WHERE id=? 
        // на каждый checkAndConsume
```

Каждый AI-запрос делает SQL-запрос за планом пользователя. При 100 PRO-юзерах и интенсивном использовании — лишняя нагрузка. Решение: кешировать план в bucket или в Redis.

---

## [INFO] #11 — Refresh token в теле ответа AuthResponse

**Файл:** `AuthService.buildAuthResponse()`

```java
return AuthResponse.builder()
    .accessToken(accessToken)
    .refreshToken(refreshToken)  // ← идёт в JSON body
```

Refresh token кладётся в httpOnly cookie (правильно), но **также** возвращается в JSON body. Фронт получает его через `data.refreshToken`. В `axios.ts` видно: `useAuthStore.getState().setTokens(data.accessToken, '')` — refreshToken там передаётся пустой строкой, но это хрупко. Либо убери из тела вообще, либо зафиксируй что фронт его игнорирует.

```java
// AuthResponse.java
// Удали поле refreshToken из DTO или помечай @JsonIgnore
// Refresh token живёт только в httpOnly cookie — этого достаточно
```

---

## [INFO] #12 — Refresh cookie: отсутствует Secure flag в prod

**Файл:** `AuthController.setRefreshTokenCookie()`

```java
ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
    .httpOnly(true)
    .path("/api/v1/auth/refresh")
    .maxAge(30 * 24 * 60 * 60)
    .sameSite("Lax")
    // .secure(true) ← отсутствует!
    .build();
```

В prod без Secure флага браузер может отправить cookie по HTTP. Если когда-либо будет mixed content или редирект через HTTP — токен утечёт.

```java
@Value("${app.cookie.secure:true}")
private boolean cookieSecure;

// ...
.secure(cookieSecure)
```

В `application-dev.yml` ставь `app.cookie.secure=false`, в prod — `true`.

---

## Итоговая таблица

| # | Severity | Что | Где |
|---|---------|-----|-----|
| 1 | CRITICAL | SSRF через url-scraping без валидации | `tracker/WebScraperService` |
| 2 | CRITICAL | Kaspi webhook: верификация подписи — заглушка, любой может дать себе PRO | `KaspiPayService.verifySignature()` |
| 3 | CRITICAL | AES/ECB — небезопасное шифрование GitHub токенов | `EncryptionUtils` |
| 4 | CRITICAL | Actuator health: `show-details: always` открыт анонимам | `application-prod.yml` |
| 5 | CRITICAL | RateLimitFilter: X-Forwarded-For spoofing → обход rate limit на login | `RateLimitFilter.getClientIpAddress()` |
| 6 | WARNING | Stripe webhook: закрыт JWT-авторизацией, Stripe не может вызвать | `SecurityConfig` |
| 7 | WARNING | Frontend axios: hardcoded localhost в prod | `axios.ts` |
| 8 | WARNING | Нет лимита на размер jobDescription → раздутые Groq-запросы | `AiApplicationRequest` |
| 9 | WARNING | Admin endpoint возвращает User entity с payment данными | `AdminController` |
| 10 | WARNING | AiRateLimiter: DB-запрос на каждый AI-вызов | `AiRateLimiter` |
| 11 | INFO | Refresh token в JSON body (дублирует cookie) | `AuthService` |
| 12 | INFO | Cookie: нет Secure флага | `AuthController` |

**Приоритет работ:** #2 (KaspiWebhook) и #1 (SSRF) — это деньги и данные, делать сейчас. #3 (AES) — до первого реального пользователя с GitHub. #4, #5 — до открытого деплоя. Остальные — в следующем спринте.