# MeDev — Полный обзор проекта (с нуля до вершин)

> Аудит и архитектурный разбор. Дата: 2026-08-14.
> Только анализ, ничего в коде не менялось.
> Уровни риска: [CRITICAL] / [WARNING] / [INFO].

---

## Оглавление

1. [Что это за проект](#1-что-это-за-проект)
2. [Стек и инфраструктура](#2-стек-и-инфраструктура)
3. [Архитектура бэкенда (модульный монолит)](#3-архитектура-бэкенда-модульный-монолит)
4. [Архитектура фронтенда (FSD)](#4-архитектура-фронтенда-fsd)
5. [Модули: разбор по доменам](#5-модули-разбор-по-доменам)
6. [Аутентификация и авторизация](#6-аутентификация-и-авторизация)
7. [Безопасность — аудит](#7-безопасность--аудит)
8. [Логические дыры и баги](#8-логические-дыры-и-баги)
9. [Схема БД и миграции](#9-схема-бд-и-миграции)
10. [AI-интеграция (Groq)](#10-ai-интеграция-groq)
11. [Биллинг (Stripe / Kaspi)](#11-биллинг-stripe--kaspi)
12. [Тесты и CI/CD](#12-тесты-и-cicd)
13. [Технический долг и что доделать](#13-технический-долг-и-что-доделать)
14. [Сводный риск-профиль](#14-сводный-риск-профиль)

---

## 1. Что это за проект

MeDev — data-first SaaS для разработчиков. Берёт активность GitHub + резюме PDF,
через AI (Groq, llama-3.1-70b) строит профиль, генерирует ATS-friendly PDF резюме
и публичную веб-страницу портфолио. Есть Job Tracker (трекер вакансий с AI-матчингом),
биллинг (Stripe + Kaspi Pay), квоты на AI-запросы, админ-панель с аудит-логами.

Позиционирование: автоматизация создания резюме/портфолио для инженеров без ручного ввода.

**Зрелость:** Production-Ready MVP. Все фазы roadmap (1–8) реализованы, бэклог аудитов закрыт.

---

## 2. Стек и инфраструктура

### Бэкенд
| Слой | Технология |
|---|---|
| Core | Java 17, Spring Boot 3.3.0 |
| DB | PostgreSQL (Flyway, 23 миграции) + pgvector (vector_store) |
| Cache | Redis (refresh tokens, rate limits, github кэш, AI-квоты) |
| Security | Spring Security, JWT (access 15 мин / refresh 30 дней в Redis), OAuth2 (GitHub + Google) |
| Resilience | Resilience4j (CircuitBreaker + Retry в GroqClient), Bucket4j (rate limit) |
| AI | Groq API через прокси-бэкенд, SSE-стриминг |
| PDF | Thymeleaf + Flying Saucer (iText) + PDFBox (текст из PDF) |
| Payments | Stripe (подписки), Kaspi Pay (mock) |
| Vector | Spring AI pgvector store + transformers (embeddings 384 dim) |
| Logging | Logstash JSON-encoder (prod), MDC (userId, requestId) |
| Deploy | Docker, Fly.io (fly.toml) |

### Фронтенд
| Слой | Технология |
|---|---|
| Core | React 19, TypeScript, Vite |
| State | Zustand (global, persist), React Query (server) |
| Forms | react-hook-form + zod |
| Styling | Tailwind CSS v4, strict GitHub Dark Mode |
| i18n | i18next |
| Routing | react-router-dom v7, lazy-чанки |
| Tests | vitest + @testing-library/react |
| Deploy | GitHub Pages (deploy.yml) |

### Инфраструктура
- `docker-compose.yml`: pgvector/pgvector:pg15, redis:alpine, backend, frontend.
- CI: `.github/workflows/ci.yml` — backend gradle build, frontend npm build.
- Deploy: `.github/workflows/deploy.yml` — frontend на GitHub Pages.
- Branch protection: require PR + status checks (`backend-build-and-test`, `frontend-build`).

---

## 3. Архитектура бэкенда (модульный монолит)

```
com.medev/
├── MeDevApplication.java          (точка входа)
├── config/                        (AsyncConfig, RateLimitFilter, RedisConfig,
│                                   StripeConfig, ServerPortCustomizer)
├── shared/
│   ├── exception/                 (GlobalExceptionHandler + доменные exception'ы)
│   └── security/                  (SecurityConfig, JwtFilter, JwtService,
│                                   SecurityUtils, EncryptionUtils,
│                                   EncryptedStringConverter, StringCryptoConverter)
└── modules/
    ├── auth/        (controller, service, security, entity, dto, repository)
    ├── profile/     (controller, service*7, entity*6, dto, repository, event)
    ├── github/      (controller, service*4, entity*2, dto, repository)
    ├── ai/          (controller, service*14, entity, dto*14, model, repository)
    ├── portfolio/   (controller, service, dto, mapper)
    ├── resume/      (controller, service — PDF/HTML генерация)
    ├── tracker/     (controller, service*2, entity, dto, repository)
    ├── billing/     (controller, service*3 — Stripe/Kaspi/Subscription)
    ├── admin/       (controller, service, dto*2)
    └── audit/       (entity, repository, service)
```

**Принципы соблюдаются:** SRP — сервисы компактные (ExperienceService, SkillService,
ProjectService, LanguageService разнесены). MapStruct для маппинга. `LlmProvider`
интерфейс + `GroqClient` реализация + `AbstractAiStructuredService` — нормальная
иерархия. Конфигурация через profiles (dev/prod).

### Что хорошо
- Чёткие границы модулей, нет god-objects.
- `SecurityUtils.getCurrentUserId()` — единая точка для ID текущего юзера.
- Профильные сервисы делегируют ownership-проверки через `getProfileEntityByUserId`.
- Event-driven: `ProfileUpdatedEvent` → `VectorizationService` (async vectorization).

---

## 4. Архитектура фронтенда (FSD)

```
src/
├── app/        (providers/AdminGuard, layouts, router/AppRouter, ErrorBoundary)
├── pages/      (auth, dashboard, profile, resume, tracker, import, portfolio,
│                billing, admin, settings, landing)
├── widgets/    (header, sidebar, portfolio, resume-builder, profile-editor)
├── features/   (onboarding, ai, profile, github, billing, job-tracker, ai-assistant)
├── entities/   (user, resume, profile, job-tracker — модели/сторы)
└── shared/     (api/axios, api/hooks, i18n, lib, ui)
```

**FSD соблюдается строго:** слои app → pages → widgets → features → entities → shared.
Импорты не пробивают слои вверх. Ленивая загрузка страниц через `lazy()` + Suspense.

### Роутинг и охрана
- `PrivateRoute` / `PublicRoute` — на основе `accessToken` из Zustand (persist).
- `AdminGuard` — проверка `username === 'admin'`.
- Базовый путь: `/MeDev/` для билда (GitHub Pages), `/` в dev.

---

## 5. Модули: разбор по доменам

### auth
- `AuthService`: register/login/refresh/logout/exchangeOauth2Code.
- Refresh token хранится в Redis по ключу `refresh:{userId}:{deviceId}`, TTL 30 дней.
- Logout удаляет только текущую сессию (по deviceId).
- `AuthRateLimiter` (Bucket4j): 20 запросов/мин на IP по auth-эндпоинтам.
- `AuthController.getClientIp()` — намеренно игнорирует `X-Forwarded-For`, берёт
  `getRemoteAddr()`, чтобы предотвратить спуфинг (работает корректно при
  `server.forward-headers-strategy=framework`).

### profile
- CRUD для 6 сущностей (Experience, Education, Skill, Language, Project + сам Profile).
- Drag-and-drop reorder через `reorder*` методов с ownership-проверкой каждого ID.
- `importParsedResume` — Smart Merge: очищает коллекции только если AI вернул данные
  для секции, иначе сохраняет старые.
- `updateFromGitHub` / `importProjects` / `addSkillIfNotExists` — импорт из GitHub.
- `ReadmeGeneratorService` — генерация Markdown README из профиля.

### github
- `GitHubService.fetchAndParseProfile`: /user, /user/repos (100, сортировка по скору),
  параллельно языки top-10, README top-5 (tech stack), организации.
- Сохраняет `GithubSnapshot` (raw JSON) — источник правды для AI.
- `GitHubGraphQLService` — contributions за 90 дней (commits, repos, events).
- `GitHubReadmeParser` — regex-парсинг известных технологий из README.
- `GitHubRepoScorer` — скоринг репо для ранжирования.

### ai
- `GroqClient implements LlmProvider`: стриминг (SSE) + structured completion (JSON mode).
  CircuitBreaker, Retry (4 попытки, backoff 4–20с), timeout 90с.
- `AiController`: chat/stream, generate (summary, project, linkedin), onboarding,
  generate-profile, cover-letter/tailor (PRO), match-job, parse-resume, feedback, quota.
- `AiRateLimiter`: Redis-счётчик, FREE=10/день, PRO=100/день.
- `TokenAccountingService`: async запись `AiUsage` (токены per запрос).
- `AiContextService`: сборка system prompt из профиля + GitHub (с кэшем 1ч).
- `VectorizationService`: embeddings профильных данных в pgvector (RAG для cover letter).
- `EvaluationService`: сохранение feedback юзера по AI-генерациям.
- Prompt injection: `sanitize()` обрезает input до 2000 символов.

### portfolio
- Публичная страница по username. Проверка `isPublic` — иначе 404 (не раскрывает факт).

### resume
- `PdfGeneratorService`: Thymeleaf → Flying Saucer PDF / HTML. Шрифты извлекаются в
  temp-файлы из classpath. 5 шаблонов (apple-modern, github, grok-monolith, milky-soft,
  phub-orange). Квота: 50 PDF/день для FREE, безлимит PRO. Avatar fetch как base64.

### tracker
- `JobApplicationService`: CRUD + ownership через `getOwnedEntity`.
- `WebScraperService`: парсинг вакансий с hh.kz/hh.ru/linkedin (белый список хостов).

### billing
- `StripeService`: Checkout Session, webhook (checkout.session.completed,
  subscription.deleted/updated, invoice.payment_failed) — авто upgrade/downgrade.
- `KaspiPayService`: mock-генерация платёжной ссылки, HMAC-SHA256 webhook verify.
- `SubscriptionService.assertPro` — gate для PRO-фич.

### admin / audit
- `AdminController`: users (с пагинацией), change plan/role, audit logs, dashboard.
- Запрет self-role-change.
- `AuditService.logAction` — async, но **нигде не вызывается** (см. [WARNING]).

---

## 6. Аутентификация и авторизация

### JWT
- Access token: 15 мин, claim `type=access`, `userId`, `role`, `deviceId`.
- Refresh token: 30 дней, `type=refresh`, хранится в Redis + HttpOnly cookie.
- `JwtFilter` проверяет `type=access` — refresh токен не принимается как access.
- `JwtService.getClaims()` требует issuer + audience — защита от чужих токенов.
- BCrypt(12) для паролей.

### OAuth2
- GitHub + Google. `CustomOAuth2UserService` — upsert юзера, привязка провайдера.
- Link-account flow через `medev_link_jwt` cookie (access-токен, 5 мин, HttpOnly+Secure).
- Short-lived `oauth2_code` в Redis (5 мин, single-use) — закрыл утечку токена в URL.
- Pre-account-creation vulnerability закрыта: парольному юзеру без OAuth при OAuth-логине
  перегенерируется пароль (рандомный) — нельзя залогиниться по старому паролю.

### Защита от IDOR
- Все profile/tracker/billing эндпоинты берут userId из `SecurityUtils.getCurrentUserId()`,
  НЕ из тела запроса.
- Ownership-проверки: `entity.getProfile().getId().equals(profile.getId())` для
  каждого update/delete/reorder — `ForbiddenException` при несовпадении.
- Reorder дополнительно проверяет, что все ID принадлежат юзеру и кол-во совпадает.

---

## 7. Безопасность — аудит

### Что сделано хорошо (green)
- IDOR закрыт системно через `SecurityUtils`.
- JWT type segregation (access vs refresh).
- OAuth2 code-exchange через Redis (нет токена в URL).
- HttpOnly + Secure + SameSite=Lax cookies.
- AES-256-GCM (`EncryptionUtils`) для `github_access_token`.
- SSRF-защита: whitelist хостов + проверка loopback/private/link-local в обоих
  WebScraperService. ai-версия дополнительно кэширует DNS (TOCTOU-защита).
- PDF MIME-проверка (content-type + magic bytes `%PDF`), лимит 10 МБ.
- Stripe webhook signature verification.
- Kaspi webhook HMAC-SHA256 + constant-time compare (`MessageDigest.isEqual`).
- CORS строгий (через env), credentials=true.
- CSRF отключён осознанно (stateless JWT, no session cookie).
- Rate limiting: Bucket4j (auth, AI-parse) + Redis (AI-квоты).
- Branch protection в CI/CD.

### Найденные проблемы

#### [WARNING] S-1. `StringCryptoConverter` использует AES/ECB/PKCS5Padding
**Файл:** `shared/security/StringCryptoConverter.java`
- ECB не использует IV — одинаковый plaintext даёт одинаковый шифротекст.
Применяется к `Profile.githubToken`.
- При этом `EncryptedStringConverter` (для `User.githubAccessToken`) использует
  AES/GCM/NoPadding — корректно. Два конвертера с разным уровнем безопасности.
- Также `StringCryptoConverter` берёт ключ из `crypto.secret`, который **не определён**
  ни в одном application*.yml → падает на дефолт `default1234567890secret1234567890`.
- `Profile.githubToken` фактически не записывается (нет `setGithubToken` в коде) —
  колонка мёртвая, но конвертер в проде использует дефолтный ключ.

#### [WARNING] S-2. Дублирующие ключи шифрования
- `encryption.secret` (для GCM-конвертера) и `crypto.secret` (для ECB-конвертера)
  — два независимых секрета, оба с захардкоженными дефолтами в dev-профиле.
  В prod `crypto.secret` не передаётся из env → ECB-конвертер падает на дефолт.

#### [WARNING] S-3. Stripe webhook не проверяет replay
- `StripeService.handleWebhook` корректно верифицирует подпись, но не хранит
  idempotency-key/event-id. Дубликат webhook'а (replay) обработается повторно —
  downgrade/upgrade сработает повторно (идемпотентен по плану, но логирует шумно).

#### [INFO] S-4. `parse-resume` создаёт临时 InputStream, не закрывает
```java
java.io.InputStream is = file.getInputStream();
if (is.read(magic) != 4 || ...) { return badRequest; }
```
InputStream не в try-with-resources при раннем return. Незакрытый поток.
(В `AiAnalysisService.extractTextFromPdf` PDFBox закрывается через try-with-resources — там ок.)

#### [INFO] S-5. `NetworkAddressCache` — глобальный side-effect
`ai/WebScraperService` в конструкторе ставит `Security.setProperty("networkaddress.cache.ttl","30")`
 глобально на всю JVM. Это affects все HTTP-клиенты в приложении (GitHub, Stripe, Groq).
 Незапланированный побочный эффект.

#### [INFO] S-6. `RateLimitFilter` использует `X-Forwarded-For` (в отличие от AuthRateLimiter)
`config/RateLimitFilter.getClientIpAddress()` берёт `X-Forwarded-For` первым —
спуфинг IP для login/AI-parse bucket'ов. `AuthRateLimiter` и `AuthController`
правильно берут `getRemoteAddr()`. Несогласованность.

#### [INFO] S-7. AI sanitize только для chat, не для structured
`AiController.sanitize()` применяется только к `/chat/stream`. Структурированные
генерации (summary, onboarding, cover-letter, tailor, match-job) принимают
произвольный текст без ограничения размера. `AiAnalysisService` обрезает PDF до
10000 символов, но `AiApplicationService` передаёт jobDescription без лимита.

#### [INFO] S-8. `AdminGuard` на фронте проверяет `username === 'admin'`
Чисто UI-проверка. Реальная защита — на бэкенде `hasRole("ADMIN")` в SecurityConfig.
Если username юзера случайно/злонамеренно = "admin", UI пустит, но бэкенд всё равно
заблокирует. Не уязвимость, но вводит в заблуждение (лучше проверять role, а не username).

---

## 8. Логические дыры и баги

#### [WARNING] L-1. `AdminService.getDashboardStats()` — заглушки
- `proUsers = 0` (закомментировано "нужен кастомный запрос").
- `totalAiTokensUsedToday = 0` (заглушка "нужно тянуть из ai_usage").
Дашборд админа показывает нули для ключевых метрик. Зафиксировано в CONTEXT.md
как backlog-задача.

#### [WARNING] L-2. `AuditService.logAction` нигде не вызывается
- Модуль audit полностью реализован (entity, repo, service, migration V19).
- Но `grep` по коду: ни один бизнес-модуль не вызывает `auditService.logAction`.
- Audit-логи будут пусты навсегда. Зафиксировано в CONTEXT.md как backlog.

#### [WARNING] L-3. Kaspi `orderId` парсится как `userId_months`
`KaspiPayService.handleWebhook`: `orderIdStr.split("_")` → `userId=parts[0]`.
Любой внешний запрос с валидной подписью (если секрет утёк) может escalate любого
userId до PRO. Подпись защищает, но orderId — user-controlled поле в ссылке
генерации. Если webhook вызовет атакующий с поддельным orderId и угаданным userId,
при скомпрометированном secretKey — privilege escalation.

#### [WARNING] L-4. `SubscriptionService.assertPro` не вызывается для части PRO-фич
- `cover-letter` и `tailor` — PRO-only (assertPro вызывается). 
- НО `match-job` НЕ вызывает assertPro — FREE-юзер может матчить.
- PDF-генерация: "pro" шаблоны блокируются проверкой `template.contains("pro")` в
  строке имени — но это не привязка к плану, а к названию. Шаблон `pro_something`
  недоступен, но `PRO` с другим регистром/именем — пройдёт.

#### [WARNING] L-5. `ResumeController` PRO-проверка через имя шаблона
```java
if (template.toLowerCase().contains("pro")) {
    throw new UnauthorizedException("PRO template requires PRO plan");
}
```
Это блокирует шаблоны С "pro" в имени для ВСЕХ (включая PRO-юзеров) — логика
инвертирована. Должно: если шаблон pro и юзер НЕ pro → block. Сейчас: любой шаблон
с "pro" всегда блокируется. Шаблоны с "pro" в имени физически недоступны.

#### [WARNING] L-6. `Profile.importProjects` — гонка при дедупликации
В коде есть комментарий "in case of previous race conditions" и ручная дедупликация
по имени. Сигнал, что гонка реально происходила. `updateFromGitHub` НЕ использует
`getProfileEntityForUpdate` (pessimistic lock) — только `getProfileEntityByUserId`
(без блокировки). `importParsedResume` использует `getProfileEntityForUpdate`.
Несогласованность: один путь блокирует, другой нет.

#### [INFO] L-7. `RedisTemplate<String, Object>` смешивает сериализаторы
`AuthController.refresh` / `AuthService.exchangeOauth2Code` используют
`redisTemplate.opsForValue().get()` с `RedisTemplate<String, String>` (через бин
`StringRedisTemplate`? — нет, в `RedisConfig` объявлен `RedisTemplate<String,Object>`
с `GenericJackson2JsonRedisSerializer`). `AuthService` инжектит
`RedisTemplate<String, String>` — это дефолтный Spring `StringRedisTemplate` бин.
`AiRateLimiter` инжектит `RedisTemplate<String, Object>`. Ключи `oauth2_code:*` и
`refresh:*` пишутся через StringRedisTemplate, читаются тем же — ок. Но
`user_plan:*` (AiRateLimiter) пишет `String` через Object-template с JSON-сериализатором
→ значение `"PRO"` сериализуется как `"PRO"` (JSON-строка с кавычками), а читается
кастом к `String` → получает `"PRO"` с кавычками? Проверить: `GenericJackson2Json`
сериализует String как `"PRO"` (с кавычками в JSON), десериализует обратно в `PRO`.
При `increment` (AiRateLimiter) значение Long сериализуется как число — ок.
Низкий риск, но смесь шаблонов — потенциальный источник багов.

#### [INFO] L-8. `User.subscriptionExpiresAt` для Stripe не устанавливается
- `StripeService.handleSuccessfulCheckout` ставит `plan=PRO`, `stripeCustomerId`,
  но НЕ ставит `subscriptionExpiresAt`.
- `SubscriptionService.assertPro` проверяет `subscriptionExpiresAt` — если null,
  проверка истечения пропускается (только `!= null && isBefore(now)`).
- Stripe-PRO бессрочен (пока webhook не сработает на cancel) — логично для подписки,
  но Kaspi-PRO имеет expiry, а Stripe-PRO — нет. Несогласованная модель подписки.

#### [INFO] L-9. `GitHubService.fetchUserPublicRepos` тянет без токена
Метод использует `webClientBuilder` без `Authorization` header → только публичные
репо (10 шт). Используется в `AiContextService.fetchGithubCached` для контекста AI.
Даже если юзер подключил GitHub (есть токен), AI-контекст берёт публичные данные без
авторизации → теряются приватные проекты. Зафиксировано в roadmap как известная
проблема (Phase 1).

#### [INFO] L-10. `ServerPortCustomizer` сканирует порты 8080–8083
Открывает ServerSocket для проверки, закрывает, ставит первый свободный. В Docker/CI
это создаёт race с другими процессами. В prod на Fly.io порт фиксирован env —
customizer всё равно выполняется (профиль `!test`). Уязвимость доступности при
конфигурации нескольких инстансов — каждый возьмёт случайный порт.

#### [INFO] L-11. `dnd-kit` в package.json, контекст противоречив
CONTEXT.md говорит "uninstalled @dnd-kit" для tracker, но `SortableList.tsx` и
`KanbanBoard.tsx` активно импортируют `@dnd-kit/*`. Зависимость в package.json
присутствует. Документация устарела.

---

## 9. Схема БД и миграции

23 миграции (V1–V23), Flyway, `ddl-auto: validate`.

### Основные таблицы
- `users` (V1) + надстройки: stripe_customer_id (V10), github_id/github_access_token (V11),
  google_id (V14), kaspi_customer_id (V22), subscription_expires_at (V23).
- `profiles` (V2): 1:1 с users, github_token (encrypted, мёртвый), section_order (V9).
- `experience` (V3), `education` (V4), `skills` (V5), `languages` (V6), `projects` (V7).
  Все с `profile_id` FK + `sort_order`.
- `subscriptions` (V8) — таблица существует, но **не используется** кодом
  (план хранится в `users.plan`). Мёртвая таблица.
- `ai_usage` (V12), `ai_evaluations` (V13).
- `job_applications` (V17) + matching fields (V21).
- `vector_store` (V18): pgvector, HNSW, cosine.
- `audit_logs` (V19).
- `github_snapshots` (V20): composite PK (user_id, fetched_at).

### Замечания
- [INFO] D-1. `subscriptions` (V8) — мёртвая таблица, не используется.
- [INFO] D-2. `profiles.github_token` — колонка encrypted, но код не пишет в неё
  (токен хранится в `users.github_access_token`). Дублирование + мёртвая колонка.
- [INFO] D-3. Никаких индексов на `ai_usage.user_id` для агрегаций (нужно для
  `getDashboardStats` токенов за день).
- [OK] Миграции никогда не модифицируются (правило CLAUDE.md соблюдается).

---

## 10. AI-интеграция (Groq)

### Архитектура
- `LlmProvider` интерфейс → `GroqClient` реализация (единственный провайдер).
- Модель: `llama-3.1-70b-versatile` (была llama-3.3-70b, обновлена — последний коммит).
- Два режима: streaming (SSE, chat) и structured (JSON mode, response_format=json_object).
- Resilience4j: CircuitBreaker + Retry (4 попытки, backoff 4с→20с) только для retriable
  (429, 5xx). 4xx (кроме 429) не ретраится.
- Timeout: streaming 120с (SseEmitter), structured 90с.
- Token accounting: async запись в `ai_usage`.

### Промпты
7 промпт-шаблонов в `resources/prompts/`, загружаются через `PromptLoader`.
- `assistant_system_v1` — senior-engineer persona.
- `resume_parser_v1`, `full_profile_generator_v1`, `onboarding_wizard_v1`,
  `summary_generator_v1`, `project_description_v1`, `linkedin_generator_v1`.

### Защиты
- JSON cleaning: снимает markdown-обёртки ` ```json ` перед парсингом (оба: GroqClient
  и AiAnalysisService — дублирование логики).
- При невалидном JSON → `RuntimeException` "Aborting to prevent data loss" —
  НЕ затирает профиль (важный фикс из истории).
- Smart Merge: GitHub = источник правды для языков/проектов, PDF — для дат/компаний.
- Запрет галлюцинации: если данных нет — поле остаётся null.

### Замечания
- [INFO] AI-1. JSON-cleaning дублируется в `GroqClient.cleanAndValidateJson` и
  `AiAnalysisService` (два места, одинаковый код). DRY-нарушение.
- [INFO] AI-2. `structuredCompletion` использует `.block()` (блокирует thread).
  Оправдано для thread-per-request, но при высокой нагрузке упрётся в thread pool.
- [WARNING] AI-3. `max_tokens=2048` фиксирован — длинные генерации (полный профиль)
  могут обрезаться без предупреждения.
- [INFO] AI-4. `VectorizationService` удаляет ВСЕ векторы юзера и пере-добавляет при
  каждом `ProfileUpdatedEvent`. O(n) на каждый чих профиля. При частом редактировании
  — лишняя нагрузка.
- [INFO] AI-5. `AiApplicationService` filter expression `"userId == '" + userId + "'"`
  — строковая конкатенация в filter. userId — Long из JWT, инъекция невозможна,
  но паттерн хрупкий.

---

## 11. Биллинг (Stripe / Kaspi)

### Stripe
- `StripeConfig` ставит `Stripe.apiKey` глобально в `@PostConstruct`.
- `createCheckoutSession`: SUBSCRIPTION mode, metadata `userId`, success/cancel URLs.
- Webhook обрабатывает 4 event-типа → upgrade/downgrade по `stripeCustomerId`.
- Цена из `stripe.pro-price-id` (env).

### Kaspi (mock)
- `createPaymentLink` — генерирует ссылку `pay.kaspi.kz/pay/{merchantId}?amount=...&orderId={userId}_{months}`.
  Реального API-вызова нет (закомментирован).
- `handleWebhook`: HMAC-SHA256 verify → парсит orderId → upgrade PRO на N месяцев.
- `subscriptionExpiresAt` устанавливается (аддитивно если уже активна).

### Замечания
- [WARNING] B-1. Kaspi webhook `orderId` — user-controlled (см. L-3).
- [INFO] B-2. Stripe не устанавливает `subscriptionExpiresAt` (см. L-8).
- [INFO] B-3. `KaspiPayService` — mock, реальная интеграция отсутствует.

---

## 12. Тесты и CI/CD

### Бэкенд-тесты (22 файла)
- `AbstractIntegrationTest` с Testcontainers (PostgreSQL, Redis) — обходит security
  config conflicts.
- Покрытие: Auth, Profile, Portfolio, AI (Groq, Analysis, Evaluation), Resume
  (PDF, templates), GitHub (Service, Scorer, GraphQL), Billing (Stripe), Admin.
- JaCoCo report (xml + html) после тестов.
- `MeDevApplicationTests.contextLoads()` — resolved (был tech debt).

### Фронтенд-тесты (9 файлов)
- vitest + @testing-library/react: stores (auth, chat, resume, upsell), pages
  (Login, Register, Dashboard), ResumeBuilder.

### CI
- `ci.yml`: backend `./gradlew build`, frontend `npm run build`. Без запуска тестов
  в CI? — `gradlew build` запускает test по умолчанию. Frontend `npm run build` =
  `tsc -b && vite build` — тесты НЕ запускаются в CI (нет `npm test`).
- `deploy.yml`: frontend → GitHub Pages, только при изменениях в `frontend/**`.
- Branch protection: require PR + status checks.

### Замечания
- [WARNING] T-1. Фронтенд-тесты не запускаются в CI (`ci.yml` только build).
- [INFO] T-2. Нет e2e тестов.
- [INFO] T-3. Нет覆盖率-gate (JaCoCo генерирует report, но нет минимального порога).

---

## 13. Технический долг и что доделать

Из CONTEXT.md "Next in Backlog" + найденное в аудите:

| # | Приоритет | Задача |
|---|---|---|
| 1 | [WARNING] | Wire `AuditService.logAction` в auth/billing/plan-change потоки |
| 2 | [WARNING] | `AdminService.getDashboardStats`: real proUsers count + tokens today |
| 3 | [WARNING] | Frontend CI: добавить `npm test` в `ci.yml` |
| 4 | [WARNING] | Унифицировать шифрование: удалить `StringCryptoConverter` (ECB) или перевести на GCM; убрать мёртвый `Profile.githubToken` |
| 5 | [WARNING] | `match-job` — добавить `assertPro` |
| 6 | [WARNING] | `ResumeController` — инвертировать PRO-проверку шаблонов |
| 7 | [WARNING] | Kaspi webhook: убрать userId из user-controlled orderId или подписывать payload целиком |
| 8 | [INFO] | Frontend CI/CD GitHub Pages deployment (deploy.yml есть, но CI без тестов) |
| 9 | [INFO] | Pagination controls в AdminUsersPage / AdminAuditPage |
| 10 | [INFO] | `UserRepository.countByPlan()` для accurate PRO count |
| 11 | [INFO] | Удалить мёртвую таблицу `subscriptions` (V8) |
| 12 | [INFO] | `GitHubService.fetchUserPublicRepos` — передавать userId+token для приватных репо |
| 13 | [INFO] | Унифицировать `RateLimitFilter.getClientIp` (убрать X-Forwarded-For) |
| 14 | [INFO] | AI sanitize для всех structured-эндпоинтов, не только chat |
| 15 | [INFO] | DRY: вынести JSON-cleaning в одно место |
| 16 | [INFO] | Обновить CONTEXT.md про dnd-kit (не удалён) |

---

## 14. Сводный риск-профиль

### CRITICAL: 0
Все ранее идентифицированные CRITICAL-проблемы (SSRF, OAuth token leak, refresh в
JSON, type segregation, IP spoofing, PDF MIME, Kaspi signature) — **закрыты**.
Проект прошёл два раунда аудита (claudeaudit.md, claudeaudit2.md) и бэклог чист.

### WARNING: 9
- S-1 AES/ECB + дефолтный ключ в `StringCryptoConverter`
- S-2 Дублирующие секреты шифрования
- S-3 Stripe webhook без idempotency
- L-1 Admin dashboard заглушки (proUsers=0, tokens=0)
- L-2 AuditService не вызывается
- L-3 Kaspi orderId user-controlled
- L-4 `match-job` без assertPro
- L-5 ResumeController инвертированная PRO-проверка
- L-6 Гонка в importProjects (нет pessimistic lock)
- B-1 (= L-3)
- T-1 Фронтенд-тесты вне CI
- AI-3 max_tokens=2048 обрезает длинные генерации

### INFO: 15
Перечислены в секциях 7–13. В основном: дублирование логики, мёртвые таблицы/колонки,
несогласованности Redis-сериализации, mock-интеграции, устаревшая документация.

### Общая оценка
Проект **выше среднего для MVP**. Архитектура чистая (модульный монолит + FSD),
SRP соблюдается, security-aware подход виден (IDOR, JWT segregation, SSRF, OAuth).
Основные риски — не в критических уязвимостях, а в **логических дырах бизнес-логики**
(PRO-gate непоследователен, admin-метрики заглушены, audit не wired) и
**несогласованностях** (два конвертера шифрования, два способа определения IP,
Stripe vs Kaspi модель подписки). Эти проблемы чинятся точечно, без рефакторинга.

---

*Аудит подготовлен как read-only обзор. В код изменений не вносилось.*
