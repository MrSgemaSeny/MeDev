# MeDev — Сводный аудит (Overview)

**Дата:** 2026-08-19  
**Ревизия:** `b7803b8` (main)  
**Источники:** MeDev_REVIEW (Devin), claudeaudit, claudeaudit2, MEDEV_AUDIT  
**Методология:** перекрёстная верификация — проблема включена только если подтверждена минимум двумя источниками или содержит конкретные строки кода/номера тестов.

---

## Общее состояние

Проект зрелый для pre-seed стадии: модульный монолит на бэкенде, FSD на фронте, 84 backend-теста + 37 frontend-тестов, Flyway V1–V23, CI, Docker, rate limiting, шифрование чувствительных полей, аудит-логи. Выше среднего для портфолио-проекта.

**К продакшену не готов.** Три блокера: CI красный (main), frontend смотрит на localhost в проде, реальная уязвимость захвата аккаунта через OAuth.

**Итоговые оценки (1–5):**

| Область            | Оценка | Главная проблема                                   |
|--------------------|--------|----------------------------------------------------|
| Архитектура        | 4      | Чистый модульный монолит, границы соблюдены        |
| Безопасность       | 2.5    | P0-дыры в OAuth, Kaspi webhook, rate limiting      |
| Биллинг            | 2      | Kaspi — мок в проде, нет идемпотентности Stripe    |
| AI-слой            | 3.5    | Circuit breaker есть, модель Groq устаревшая       |
| Frontend           | 3.5    | FSD + тесты, но токен в localStorage               |
| Тесты              | 3      | 84 теста, но billing/tracker/OAuth почти не крыты  |
| CI/CD              | 2      | Main красный, фронт-тесты не гоняются в CI         |
| Документация       | 4      | README, ARCHITECTURE, RUNBOOK — сильная сторона    |

---

## P0 — Блокеры (чинить до любого деплоя)

### P0-1 — CI красный, `./gradlew build` падает
**Файл:** `backend/src/test/java/com/medev/modules/resume/service/ResumeTemplateIntegrationTest.java`

`@SpringBootTest` поднимает полный контекст, Flyway идёт в реальный Postgres → `ConnectException`. Локально: `84 tests, 1 failed`. GitHub Actions runs 32225923042, 32224895566, 32000097547 — все красные.

**Фикс:** заменить `@SpringBootTest` на unit-тест с самостоятельно собранным `SpringTemplateEngine + ClassLoaderTemplateResolver`, либо унаследовать от `AbstractIntegrationTest` (Testcontainers уже настроен).

**Время:** 30 мин.

---

### P0-2 — Захват аккаунта через OAuth (account takeover)
**Файл:** `auth/service/CustomOAuth2UserService.java`, строка ~102

`loadUser` ищет пользователя по `findByEmail(finalEmail)` и привязывает OAuth-провайдера к найденному аккаунту, перезаписывая пароль случайным значением. Два вектора атаки:

- GitHub: берётся `attributes.get("email")` — публичный профильный email, GitHub не верифицирует владение. Скоуп `user:email` запрошен, но `/user/emails` (verified) не читается.
- Google: `email_verified` не проверяется.

Итог: атакующий создаёт GitHub аккаунт с email жертвы → логинится через OAuth → легитимный пользователь теряет доступ (пароль перезаписан).

**Фикс:**
- GitHub: тянуть `GET /user/emails`, брать только `primary && verified`.
- Google: требовать `email_verified == true`.
- Автоматическую привязку к password-аккаунту заменить на явный flow: "войдите паролем и подтвердите привязку". Пароль не трогать.

**Время:** 2–3 часа.

---

### P0-3 — Kaspi Pay: мок в проде, webhook выдаёт PRO
**Файл:** `billing/service/KaspiPayService.java`

`createPaymentLink` возвращает захардкоженный URL, реального вызова API нет. При этом `POST /v1/billing/webhook/kaspi` открыт публично. `verifySignature` принимает **любую непустую подпись** (`return true`). `kaspi.secret-key` имеет дефолт `dummy-secret-key`, который не попадает в чёрный список.

Итог: любой POST с `{"orderId":"42_12","status":"COMPLETED"}` и `X-Kaspi-Signature: x` → апгрейд произвольного пользователя до PRO.

**Фикс минимум:** закрыть эндпоинт фича-флагом (`@ConditionalOnProperty`) пока нет реальной интеграции. Добавить fail-fast на дефолтный ключ в prod (как сделано в `EncryptionUtils.init`).

**Время:** 1 час.

---

### P0-4 — Frontend смотрит на localhost в продакшене
**Файлы:** `frontend/src/shared/api/axios.ts:6`, `LoginPage`, `RegisterPage`, `GithubImport`

`.github/workflows/deploy.yml` собирает фронт без `VITE_API_URL`. Дефолт — `http://localhost:8080/api/v1`. `createBrowserRouter` на GitHub Pages даёт 404 при прямом заходе на `/dashboard` (нет SPA-fallback `404.html`).

**Фикс:**
```typescript
// frontend/.env.production
VITE_API_URL=https://api.medev.app/api/v1

// axios.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';
```
Добавить `404.html` с редиректом для GitHub Pages SPA.

**Время:** 30 мин.

---

## P1 — Высокий приоритет (чинить в первом спринте после разблокировки)

### P1-1 — subscriptionExpiresAt не проверяется — PRO бесконечный
**Файл:** `billing/service/SubscriptionService.java`, метод `assertPro()`

```java
if (user.getPlan() != User.Plan.PRO) throw new AccessDeniedException(...);
// subscriptionExpiresAt — не проверяется совсем
```

Kaspi выставляет `subscriptionExpiresAt`, Stripe — нет. Никто не проверяет истечение. Пользователь купил подписку на месяц → навсегда остаётся PRO если не придёт webhook `REFUNDED`/`COMPLETED` с другим статусом.

**Фикс:** проверять `subscriptionExpiresAt` в `assertPro()` + scheduled job на hourly downgrade.

**Время:** 1.5 часа.

---

### P1-2 — Rate limit обходится подменой заголовка
**Файл:** `config/RateLimitFilter.java`, строка 63

```java
String xForwardedForHeader = request.getHeader("X-Forwarded-For");
return xForwardedForHeader.split(",")[0]; // пользователь контролирует этот хедер
```

`AuthController.getClientIp()` решает это правильно через `getRemoteAddr()`. Дополнительно: два rate limiter на `/v1/auth/login` с противоречащими лимитами — `RateLimitFilter` (5 req/min) и `AuthRateLimiter` (20 req/min). Защита определяется уязвимым компонентом.

**Фикс:** удалить `RateLimitFilter` полностью — его покрывает `AuthRateLimiter`. Один rate limiter на один эндпоинт.

**Время:** 30 мин.

---

### P1-3 — PRO-гейт на шаблонах резюме — фикция
**Файл:** `resume/controller/ResumeController.java`, строки 22 и 39

```java
template.toLowerCase().contains("pro") // проверяет имя шаблона, не план пользователя
```

Платные шаблоны не защищены. Любой шаблон со словом "pro" в имени недоступен вообще никому.

**Фикс:** `user.getPlan() == PRO` + белый список имён шаблонов через `Set.of(...)`.

**Время:** 45 мин.

---

### P1-4 — Имя шаблона из URL идёт прямо в шаблонизатор
**Файл:** `resume/service/PdfGeneratorService.java`, строки 95 и 155

```java
templateEngine.process("resume/" + templateName, context) // без валидации
```

Позволяет отрендерить любой шаблон из classpath. 500 на произвольном вводе. Path traversal вектор.

**Фикс:**
```java
private static final Set<String> ALLOWED_TEMPLATES = Set.of(
    "apple-modern", "github", "grok-monolith", "milky-soft", "phub-orange"
);
if (!ALLOWED_TEMPLATES.contains(templateName)) return ResponseEntity.badRequest().build();
```

**Время:** 20 мин.

---

### P1-5 — Access token в localStorage
**Файл:** `frontend/src/entities/user/model/store.ts`

`accessToken` персистится через `zustand/persist` (localStorage). Любой XSS = угон сессии. Бэкенд возвращает `refreshToken` в теле `AuthResponse` — сводит на нет смысл HttpOnly-cookie. Мёртвый код `localStorage.setItem('refreshToken', ...)` присутствует.

**Фикс:** access-токен держать в памяти (React state / Zustand без persist), восстанавливать по refresh-cookie при загрузке. `refreshToken` убрать из тела `AuthResponse`.

**Время:** 2 часа.

---

### P1-6 — AdminGuard проверяет username, а не роль
**Файл:** `frontend/src/app/providers/AdminGuard.tsx`, строка 12

```typescript
if (username !== 'admin') // фикция
```

`admin` — зарезервированное имя, настоящий администратор с другим username в админку не попадёт. Бэкенд требует `ROLE_ADMIN` — защита есть, но фронт-гейт бессмысленный.

**Фикс:** класть `role` в `AuthResponse` и в стор, проверять `role === 'ADMIN'`.

**Время:** 30 мин.

---

### P1-7 — Модель Groq устаревшая, хардкод в двух местах
**Файл:** `ai/client/GroqClient.java`, строки 35–36

`llama-3.1-70b-versatile` выведена из эксплуатации. Актуальная: `llama-3.3-70b-versatile`. Все AI-фичи, вероятно, возвращают 400/404 в проде.

**Фикс:** вынести в конфиг (`application.yml: groq.model`), убрать хардкод.

**Время:** 15 мин.

---

### P1-8 — Конфликт конфигурации Stripe между профилями
**Файлы:** `StripeConfig.java`, `StripeService.java:34`, `application-prod.yml`

Код читает `stripe.api-key`, prod-конфиг объявляет `stripe.secret-key: ${STRIPE_SECRET_KEY}` без дефолта. Дефолт `sk_test_12345` в `application.yml` уедет в прод если переменную забыть.

**Фикс:** привести к одному ключу, добавить fail-fast на дефолтное значение в prod-профиле.

**Время:** 30 мин.

---

### P1-9 — Нет идемпотентности вебхуков Stripe
**Файл:** `billing/service/StripeService.java`, метод `handleWebhook()`

Обработанные `event.id` не хранятся. Повторная доставка (норма для Stripe) → повторный апгрейд/даунгрейд. `invoice.payment_failed` немедленно роняет план в FREE без grace period.

**Фикс:** хранить обработанные event.id в Redis с TTL 24h. Добавить grace period (3–7 дней) перед даунгрейдом.

**Время:** 2 часа.

---

### P1-10 — SSRF через url-scraping без валидации
**Файл:** `tracker/controller/JobApplicationController.java` → `GET /v1/tracker/applications/scrape?url=...`

`Jsoup.connect(url).get()` подключается к любому хосту: `http://169.254.169.254/` (AWS metadata), `http://localhost:6379` (Redis), внутренние сервисы.

**Фикс:** белый список хостов + проверка DNS на loopback/site-local адреса:
```java
private static final Set<String> ALLOWED_HOSTS = Set.of(
    "hh.kz", "hh.ru", "linkedin.com", "www.linkedin.com", "indeed.com"
);
```

**Время:** 1 час.

---

### P1-11 — medev_link_jwt cookie: не httpOnly, не Secure
**Файл:** `auth/handler/OAuth2LoginSuccessHandler.java`

`refresh_token` cookie выставлен правильно. `medev_link_jwt` создаётся через `jakarta.servlet.http.Cookie` без httpOnly, Secure, SameSite. Несёт JWT авторизованного пользователя. XSS → угон OAuth-привязки.

**Фикс:** заменить на `ResponseCookie` с `.httpOnly(true).secure(true).sameSite("Lax").maxAge(Duration.ofMinutes(5))`.

**Время:** 30 мин.

---

## P2 — Средний приоритет (следующий спринт)

| # | Что | Файл | Время |
|---|-----|------|-------|
| P2-1 | VectorStore — заглушка, `MockVectorStoreConfig` no-op, pgvector не используется | `ai/config/MockVectorStoreConfig.java` | Решить судьбу: доделать или удалить модуль |
| P2-2 | Bucket4j в `build.gradle` но нигде не используется, лимиты через INCR+EXPIRE | `build.gradle` | Убрать зависимость или перейти на Bucket4j |
| P2-3 | Гонка в счётчиках: INCR + EXPIRE не атомарны → вечный бан при падении между вызовами | `auth/service/AuthRateLimiter.java` | Lua-скрипт или `SET NX EX` + INCR |
| P2-4 | Кэш плана 15 мин → PRO не активируется сразу после оплаты | `ai/service/AiRateLimiter.java` | Инвалидировать `user_plan:{id}` в webhook-обработчиках |
| P2-5 | `(Integer) redisTemplate.opsForValue().get(key)` — хрупкое приведение | `AiRateLimiter.java`, `PdfGeneratorService.java` | Отдельный `StringRedisTemplate` для счётчиков |
| P2-6 | Блокирующая загрузка аватара в PDF-генерации (`HttpURLConnection` без таймаутов) | `PdfGeneratorService.fetchAvatarBase64()` | `RestTemplate` с таймаутом или async |
| P2-7 | 3 DB-запроса к `users` на один AI-вызов (RateLimiter + SubscriptionService + AiContextService) | ai-модуль | Добавить `plan` в JWT claims |
| P2-8 | Google OAuth: пустой username из `!!!@gmail.com`, reserved names не проверяются | `CustomOAuth2UserService.java` | Fallback `user_` + UUID, проверка RESERVED_USERNAMES |
| P2-9 | `/scrape` без rate limit — thread pool exhaustion при параллельных запросах | `JobApplicationController.java` | `scraperRateLimiter.checkAndConsume(userId)` |
| P2-10 | `ReorderRequest` без `@Size(max)` → N UPDATE-запросов без лимита | `shared/dto/ReorderRequest.java` | `@Size(max = 100)` |
| P2-11 | Actuator `show-details: always` в prod | `application-prod.yml` | `when_authorized`, `/actuator/**` → ROLE_ADMIN |
| P2-12 | Refresh cookie без Secure флага | `auth/controller/AuthController.java` | `.secure(${app.cookie.secure:true})` |
| P2-13 | CI: фронт-тесты не гоняются, `npm run lint` отсутствует, Node `20` вместо `22` | `.github/workflows/deploy.yml` | Добавить шаги, зафиксировать Node 22 |

---

## P3 — Гигиена (перед публичным запуском)

- `.idea/` закоммичен в репо, корневой `.gitignore` — 5 строк
- Артефакты в корне: `Inter.zip` (194 КБ), `fix_templates.py`, `test_xml.py`, `redesign.cjs`, `fix_ts.cjs`, `fix-imports.cjs`, `Roboto-Regular.b64`, `inject_fonts.js`, `download_full_fonts.js`
- `EncryptedStringConverter` и `StringCryptoConverter` — два класса с одинаковой логикой
- Три `yml`-файла описывают `stripe.*` по-разному
- `AiAnalysisService` + `AiGenerateService` — silent fail при парсинге дат: `catch (Exception ignored) {}` без лога
- Dependabot PR стабильно красные (ломится в мажоры Spring Boot 4.x) — настроить `ignore` мажоров
- `.agents/hooks.json` завязан на `powershell.exe` → не работает в CI и на Linux

---

## Приоритизированный порядок работ

```
Sprint 0 (разблокировать, 1 день):
  P0-1  Починить ResumeTemplateIntegrationTest → зелёный CI
  P0-4  VITE_API_URL в deploy.yml + SPA fallback
  P1-7  Обновить модель Groq → вынести в конфиг
  P1-8  Привести конфиг Stripe к одному ключу

Sprint 1 (безопасность, 3–4 дня):
  P0-2  OAuth account takeover — верифицированные email, явная привязка
  P0-3  Kaspi webhook за фича-флаг + fail-fast на дефолтный ключ
  P1-2  Удалить RateLimitFilter, оставить AuthRateLimiter
  P1-3  Реальный PRO-гейт на шаблонах
  P1-4  Белый список шаблонов в PdfGeneratorService
  P1-5  Access token из localStorage → память
  P1-6  AdminGuard по role, не username
  P1-10 SSRF whitelist в WebScraperService
  P1-11 medev_link_jwt → ResponseCookie с httpOnly

Sprint 2 (устойчивость, 3–5 дней):
  P1-1  subscriptionExpiresAt в assertPro() + scheduled downgrade
  P1-9  Идемпотентность Stripe webhooks + grace period
  P2-3  Атомарные лимиты (Lua)
  P2-4  Инвалидация кэша плана в webhook
  P2-7  plan в JWT → убрать лишние DB-запросы
  P2-8  Google OAuth username fallback + reserved names
  P2-9  Rate limit на /scrape
  P2-13 CI: lint + тесты фронта + Node 22

Sprint 3 (качество, 1+ неделя):
  P2-1  Решить судьбу pgvector/spring-ai и Bucket4j
  P2-2  P2-5  P2-6  P2-10  P2-11  P2-12
  P3    Гигиена репозитория
```

---

## Что требует ручной проверки (расхождения между источниками)

Три места, где аудиты противоречат друг другу — нужно открыть файл и посмотреть самому:

1. **`EncryptionUtils.java`** — там `getInstance("AES")` (ECB, критично) или `getInstance("AES/GCM/NoPadding")` (ок)?
2. **`AiController.parseResume()`** — есть проверка magic bytes `%PDF` или нет? Один источник говорит "есть", другой — "нет".
3. **`SecurityConfig.java`** — `/v1/billing/webhook` в `permitAll()` или нет? Если нет — Stripe не может вызвать его вообще.

---

*Сводный аудит на основе перекрёстной верификации четырёх источников. Проблема включена если подтверждена минимум двумя источниками или содержит конкретные строки/номера из кода.*
