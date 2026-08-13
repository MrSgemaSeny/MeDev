Хватит данных. Пишу отчёт.

---

# Дублирование и логические дыры: MeDev

---

## [CRITICAL] #1 — subscriptionExpiresAt никогда не проверяется

Это самая серьёзная логическая дыра в биллинге.

В `User` есть поле `subscriptionExpiresAt`. Kaspi устанавливает его явно (`now.plusMonths(months)`). Stripe — нет, он не трогает это поле вообще. Но главное: **нигде в коде не проверяется, истёк ли срок**.

`SubscriptionService.assertPro()`:
```java
if (user.getPlan() != User.Plan.PRO) {
    throw new AccessDeniedException(...);
}
// subscriptionExpiresAt — не проверяется совсем
```

Итог: пользователь купил Kaspi-подписку на 1 месяц → `subscriptionExpiresAt` выставлен → по истечении никто не переключает его обратно в FREE. Он навсегда остаётся PRO, если не придёт webhook `REFUNDED`. У Stripe аналогично: если подписка истекает или не продлевается — только webhook `customer.subscription.deleted` снимает PRO. Если webhook не дошёл (а он не дойдёт, пока endpoint закрыт JWT) — пользователь PRO вечно.

**Фикс — проверка в assertPro:**

```java
public void assertPro(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

    if (user.getPlan() != User.Plan.PRO) {
        throw new AccessDeniedException("This feature requires a PRO subscription.");
    }
    
    // Для Kaspi (time-based) — проверяем срок
    if (user.getSubscriptionExpiresAt() != null 
            && user.getSubscriptionExpiresAt().isBefore(LocalDateTime.now())) {
        // Автоматически downgrade — не ждём webhook
        user.setPlan(User.Plan.FREE);
        userRepository.save(user);
        throw new AccessDeniedException("Your PRO subscription has expired.");
    }
}
```

И нужен scheduled job для batch-даунгрейда:

```java
@Scheduled(cron = "0 0 * * * *") // каждый час
@Transactional
public void downgradeExpiredSubscriptions() {
    List<User> expired = userRepository.findByPlanAndSubscriptionExpiresAtBefore(
        User.Plan.PRO, LocalDateTime.now()
    );
    expired.forEach(u -> u.setPlan(User.Plan.FREE));
    userRepository.saveAll(expired);
    log.info("Downgraded {} expired subscriptions", expired.size());
}
```

---

## [CRITICAL] #2 — medev_link_jwt cookie: не httpOnly, не Secure

**Файл:** `OAuth2LoginSuccessHandler.java`

```java
// refresh_token cookie — правильно:
ResponseCookie.from("refresh_token", ...).httpOnly(true).sameSite("Lax")...

// link_jwt cookie — неправильно:
jakarta.servlet.http.Cookie linkCookie = new jakarta.servlet.http.Cookie("medev_link_jwt", "");
linkCookie.setPath("/");
linkCookie.setMaxAge(0);
// нет httpOnly! нет Secure! нет SameSite!
```

`medev_link_jwt` несёт JWT токен авторизованного пользователя. Эту куку читает `CustomOAuth2UserService` для flow "привязка GitHub к существующему аккаунту". Если атакующий может выполнить XSS — он украдёт этот JWT и сможет привязать свой GitHub к жертве.

**Фикс — заменить `jakarta.servlet.http.Cookie` на `ResponseCookie`:**

```java
// В OAuth2LoginSuccessHandler — при установке link cookie (до редиректа на OAuth2):
ResponseCookie linkCookie = ResponseCookie.from("medev_link_jwt", jwtToken)
        .httpOnly(true)
        .secure(true)       // только HTTPS
        .path("/")
        .maxAge(Duration.ofMinutes(5))  // короткое TTL
        .sameSite("Lax")
        .build();
response.addHeader(HttpHeaders.SET_COOKIE, linkCookie.toString());

// При очистке после успешного linking:
ResponseCookie clearCookie = ResponseCookie.from("medev_link_jwt", "")
        .httpOnly(true)
        .secure(true)
        .path("/")
        .maxAge(0)
        .sameSite("Lax")
        .build();
response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());
```

---

## [CRITICAL] #3 — parse-resume: MIME type не проверяется

**Файл:** `AiController.java` → `AiAnalysisService.parseResumePdf()`

```java
@PostMapping("/parse-resume")
public ResponseEntity<ProfileDto> parseResume(@RequestParam("file") MultipartFile file) {
    if (file.getSize() > 10 * 1024 * 1024) {
        return ResponseEntity.badRequest().build();
    }
    // Нет проверки content type — принимается любой файл
    AiParsedResumeDto parsed = aiAnalysisService.parseResumePdf(file, currentProfile);
```

PDFBox (`Loader.loadPDF`) попытается распарсить любой файл как PDF. Можно загрузить `.exe`, `.zip`, произвольный бинарник — PDFBox либо упадёт с исключением (которое съедается в RuntimeException), либо вернёт мусор в Groq. Это также вектор для DoS через malformed PDF, вызывающий OOM в PDFBox.

**Фикс:**

```java
@PostMapping("/parse-resume")
public ResponseEntity<ProfileDto> parseResume(@RequestParam("file") MultipartFile file) {
    // 1. Размер
    if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024) {
        return ResponseEntity.badRequest().build();
    }
    // 2. MIME type по Content-Type хедеру
    String contentType = file.getContentType();
    if (!"application/pdf".equals(contentType)) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
    }
    // 3. Магические байты — реальная проверка (первые 4 байта PDF: %PDF)
    try {
        byte[] header = Arrays.copyOf(file.getBytes(), 4);
        if (!Arrays.equals(header, new byte[]{0x25, 0x50, 0x44, 0x46})) { // %PDF
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }
    } catch (IOException e) {
        return ResponseEntity.badRequest().build();
    }
    // ...дальше
```

---

## [WARNING] #4 — Дублирование: 5 одинаковых сервисов для профиль-секций

`ExperienceService`, `SkillService`, `LanguageService`, `ProjectService`, `EducationService` — это один и тот же паттерн, скопированный 5 раз. В каждом:

```java
Profile profile = profileService.getProfileEntityByUserId(userId);      // одинаково
Entity entity = repository.findById(id).orElseThrow(...);               // одинаково
if (!entity.getProfile().getId().equals(profile.getId())) throw new ForbiddenException(...); // одинаково
```

Это не просто код-смелл — это **риск рассинхронизации**. Если ownership-проверку нужно поменять, придётся менять в 5 местах. Уже сейчас есть расхождение: в `SkillService.updateSkill()` нет проверки на `null` у `isCurrent`, а в `ExperienceService` — есть.

**Правильное решение — generic base class:**

```java
// shared/service/ProfileSectionService.java
public abstract class ProfileSectionService<E, D, R extends JpaRepository<E, Long>> {

    protected final R repository;
    protected final ProfileService profileService;

    protected abstract Profile getProfile(E entity);
    protected abstract void doUpdate(E entity, Object request);

    protected E getOwnedEntity(Long userId, Long entityId) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        E entity = repository.findById(entityId)
                .orElseThrow(() -> new NotFoundException("Entity not found"));
        if (!getProfile(entity).getId().equals(profile.getId())) {
            throw new ForbiddenException("Access denied");
        }
        return entity;
    }

    public void delete(Long userId, Long entityId) {
        repository.delete(getOwnedEntity(userId, entityId));
    }

    public void reorder(Long userId, List<Long> ids,
                        BiConsumer<Long, Integer> updateSortOrder) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        List<E> items = repository.findAllById(ids);
        boolean allOwned = items.stream()
                .allMatch(e -> getProfile(e).getId().equals(profile.getId()));
        if (!allOwned || items.size() != ids.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < ids.size(); i++) {
            updateSortOrder.accept(ids.get(i), i);
        }
    }
}
```

Это future consideration — делать сейчас не обязательно, но **при следующем добавлении новой секции профиля** — только через base class, не копипастой.

---

## [WARNING] #5 — Reorder: нет лимита на количество IDs → N UPDATE-запросов в одной транзакции

**Файл:** все пять `*Service.reorder*()`

```java
// ReorderRequest.java
private List<Long> ids; // нет @Size(max = ...)

// ExperienceService.reorderExperience:
for (int i = 0; i < orderedIds.size(); i++) {
    experienceRepository.updateSortOrder(orderedIds.get(i), i); // N отдельных UPDATE
}
```

Проблема двойная: можно прислать список из 10000 ID → 10000 UPDATE в одной транзакции. И каждый `updateSortOrder` — это отдельный `@Modifying @Query`, т.е. отдельный flush.

**Фикс:**

```java
// ReorderRequest.java
@NotNull
@Size(max = 100, message = "Cannot reorder more than 100 items at once")
private List<Long> ids;
```

И для производительности — заменить N отдельных UPDATE на batch:

```java
// В репозитории — нативный batch через JPQL VALUES или jdbcTemplate
@Modifying
@Query(value = "UPDATE experiences SET sort_order = CASE id " +
               "WHEN :id1 THEN :order1 WHEN :id2 THEN :order2 ... END WHERE id IN :ids",
       nativeQuery = true)
// Или проще — через JdbcTemplate с batchUpdate
```

Для MVP достаточно ограничить `@Size(max = 100)` — это уберёт вектор злоупотребления.

---

## [WARNING] #6 — Дублирование rate limiters: RateLimitFilter + AuthRateLimiter на одном эндпоинте

Это было в security-отчёте, но здесь логический аспект: конфигурации противоречат друг другу.

`RateLimitFilter` — 5 req/min на login (по IP через X-Forwarded-For).
`AuthRateLimiter` — 20 req/min на все auth endpoints (по `getRemoteAddr()`).

Итог: для `/v1/auth/login` применяются **оба** лимита одновременно. Срабатывает тот, что меньше — `RateLimitFilter` с 5 req/min. Но `RateLimitFilter` уязвим к spoofing, а `AuthRateLimiter` — нет. Значит реальная защита от bruteforce определяется уязвимым компонентом.

**Решение:** удали `RateLimitFilter` полностью — его покрывает `AuthRateLimiter`. Оставь только один rate limiter на один эндпоинт.

---

## [WARNING] #7 — Google OAuth: пустой username из email типа `+@gmail.com` или `123@gmail.com`

```java
username = email.substring(0, email.indexOf("@"))
               .toLowerCase()
               .replaceAll("[^a-z0-9._-]", "");
// email = "+user@gmail.com" → username = "" (пустая строка)
// email = "123user@gmail.com" → username = "123user" (нормально)
// email = "!!!@gmail.com" → username = "" (пустая строка)
```

Пустой `username` пройдёт в `userRepository.save()`. Колонка `unique = true, nullable = false` — либо NPE, либо constraint violation, которое не обработано. Пользователь не может зарегистрироваться.

```java
// После вычисления username:
if (username == null || username.isBlank()) {
    username = "user_" + UUID.randomUUID().toString().substring(0, 8);
}
// Проверить что в RESERVED_USERNAMES нет этого (в OAuth flow нет этой проверки!)
if (RESERVED_USERNAMES.contains(username)) {
    username = username + "_" + UUID.randomUUID().toString().substring(0, 4);
}
```

Кстати — `RESERVED_USERNAMES` проверяется в `AuthService.register()`, но **не в `CustomOAuth2UserService`**. OAuth пользователь может получить username `admin` если `admin@gmail.com` не занят.

---

## [WARNING] #8 — Tracker: `/scrape` не rate limited, не ограничен по времени

```java
@GetMapping("/scrape")
public CreateJobApplicationRequest scrape(@RequestParam String url) {
    return scraperService.scrapeJobUrl(url); // 10 секунд таймаут, без rate limit
```

Любой авторизованный пользователь может вызывать эндпоинт раз в секунду. Каждый вызов открывает HTTP-соединение, держит поток 10 секунд. 50 параллельных запросов = thread pool исчерпан.

```java
// JobApplicationController — добавить rate limiting:
@GetMapping("/scrape")
public CreateJobApplicationRequest scrape(
        @RequestParam String url,
        Authentication auth) {
    // Используй тот же AiRateLimiter или отдельный ScraperRateLimiter
    Long userId = (Long) auth.getPrincipal();
    scraperRateLimiter.checkAndConsume(userId); // 10 scrape/hour per user
    return scraperService.scrapeJobUrl(url);
}
```

---

## [WARNING] #9 — Дублирование логики "поднять User из DB" в AI-модуле

На один запрос к cover letter / tailor:

1. `AiRateLimiter.checkAndConsume()` → `userRepository.findById()` [DB #1]
2. `SubscriptionService.assertPro()` → `userRepository.findById()` [DB #2]
3. `AiContextService.buildUserContextBlock()` → `userRepository.findById()` [DB #3]

Три запроса к одной строке в таблице `users`. `JwtFilter` уже аутентифицировал пользователя — роль и план могут быть в JWT.

**Рабочее решение для MVP** — добавить план в JWT claims и читать его из токена, а не из DB:

```java
// JwtService.buildToken():
.claim("plan", user.getPlan().name())   // добавить

// AiRateLimiter — убрать DB-запрос:
public void checkAndConsume(Long userId, String planFromToken) {
    int limit = "PRO".equals(planFromToken) ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
    Bucket bucket = buckets.computeIfAbsent(userId, k -> createBucket(limit));
    // ...
}

// JwtFilter — передавать план в Authentication details:
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    userId, null, authorities
);
authToken.setDetails(Map.of("plan", jwtService.extractPlan(token)));
```

---

## [INFO] #10 — EvaluationService: feedback не rate limited

```java
@PostMapping("/feedback")
public ResponseEntity<Void> submitFeedback(@RequestBody EvaluationRequest request) {
    Long userId = SecurityUtils.getCurrentUserId();
    evaluationService.saveFeedback(userId, request); // нет лимита
```

Можно заспамить таблицу `ai_evaluations` тысячами записей. Мелкая дыра, но реальная — стоит добавить лимит 100 feedbacks/day/user или хотя бы `@Size(max = 1000)` на поле `notes`.

---

## [INFO] #11 — ProfileService.importParsedResume: silent fail при парсинге дат

```java
try {
    exp.setStartDate(java.time.LocalDate.parse(e.getStartDate() + "-01"));
} catch (Exception ignored) {}  // ← дата просто не установится, молча
```

Если AI вернул дату в формате `"2023"` вместо `"2023-01"` — дата теряется. Никакого лога, никакого fallback. Минимум — добавить `log.warn()`:

```java
} catch (DateTimeParseException ex) {
    log.warn("Could not parse date '{}' for experience at company '{}'", 
             e.getStartDate(), e.getCompany());
}
```

---

## Итог по дублированию и дырам

| # | Severity | Что | Где |
|---|---------|-----|-----|
| 1 | CRITICAL | subscriptionExpiresAt никогда не проверяется — PRO вечный | `SubscriptionService.assertPro()` |
| 2 | CRITICAL | medev_link_jwt cookie: не httpOnly, не Secure | `OAuth2LoginSuccessHandler` |
| 3 | CRITICAL | parse-resume: нет проверки MIME type / magic bytes | `AiController`, `AiAnalysisService` |
| 4 | WARNING | 5 сервисов — точный копипаст, ownership-логика дрейфует | все `*Service` в `profile/service/` |
| 5 | WARNING | Reorder: нет `@Size(max)` → N UPDATE-запросов без лимита | `ReorderRequest`, все `reorder*()` |
| 6 | WARNING | Два rate limiter на login с противоречащими лимитами | `RateLimitFilter` + `AuthRateLimiter` |
| 7 | WARNING | Google OAuth: зарезервированные username не проверяются, пустой username из спец-символов | `CustomOAuth2UserService` |
| 8 | WARNING | `/scrape` без rate limit — thread pool exhaustion | `JobApplicationController` |
| 9 | WARNING | 3 DB-запроса к `users` на один AI-вызов | `AiRateLimiter`, `SubscriptionService`, `AiContextService` |
| 10 | INFO | Feedback endpoint без лимита | `AiController.submitFeedback()` |
| 11 | INFO | Silent fail при парсинге дат из AI-ответа | `ProfileService.importParsedResume()` |

**Порядок работ:** #1 и #2 — завтра. #3 — перед открытием upload. #7 — перед открытием OAuth. Остальные — следующий спринт.