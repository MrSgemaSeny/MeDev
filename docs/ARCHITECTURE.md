# Архитектура MeDev

Документ описывает верхнеуровневую архитектуру, модули, концепцию безопасности и организацию данных в платформе MeDev (data-first SaaS для разработчиков: авто-генерация резюме и портфолио из GitHub-активности).

---

## 1. Стек технологий

| Слой | Технология |
|---|---|
| **Backend** | Spring Boot 3.3.0, Java 17, PostgreSQL (Flyway), Redis (refresh tokens + rate limits + AI-квоты + кэш), Gradle |
| **Frontend** | React 19, Vite, TypeScript, Tailwind v4, Feature-Sliced Design (FSD), Zustand + React Query, i18next |
| **Безопасность** | Spring Security, JWT (access 15 мин + refresh 30 дней в Redis), OAuth2 (GitHub + Google), AES-256-GCM для токенов |
| **Resilience** | Resilience4j (CircuitBreaker + Retry в GroqClient), Bucket4j (rate limit) |
| **AI** | Groq API (llama-3.1-70b-versatile), SSE-стриминг, pgvector (RAG, embeddings 384 dim) |
| **PDF** | Thymeleaf + Flying Saucer (iText) + PDFBox (текст из PDF) |
| **Payments** | Stripe (подписки), Kaspi Pay (mock) |
| **Observability** | Actuator (health, metrics, prometheus), Logstash JSON-encoder, MDC |
| **Инфраструктура** | Fly.io (backend), GitHub Pages (frontend), GitHub Actions (CI/CD) |

---

## 2. Архитектура бэкенда (модульный монолит)

Бэкенд организован по модульному принципу внутри `com.medev.modules`. Все API запросы роутятся через `context-path=/api` и версионированы как `/v1/**` (итоговые пути `/api/v1/...`).

```
com.medev/
├── MeDevApplication.java          (точка входа)
├── config/                        (AsyncConfig, RateLimitFilter, RedisConfig, StripeConfig, ServerPortCustomizer)
├── shared/
│   ├── exception/                 (GlobalExceptionHandler + доменные exception'ы)
│   └── security/                 (SecurityConfig, JwtFilter, JwtService, SecurityUtils, EncryptionUtils, конвертеры)
└── modules/
    ├── auth/          # JWT, OAuth2 (GitHub/Google), refresh rotation, rate-limiting
    ├── profile/       # CRUD experience/education/skills/languages/projects + Smart Merge
    ├── github/        # Импорт репо, языков, README tech-stack, GraphQL contributions, snapshots
    ├── ai/            # GroqClient, streaming, structured (JSON), RAG vectorization, rate limits, token accounting
    ├── portfolio/     # Публичная страница по username
    ├── resume/        # PDF/HTML генерация (6 шаблонов с поддержкой кириллицы), квоты
    ├── tracker/       # Job applications CRUD + JD scraping + AI matching
    ├── billing/       # Stripe (подписки), Kaspi Pay (интеграция), assertPro gate
    ├── admin/         # Управление юзерами, ролями, планами, AI-метрики
    └── audit/         # Audit logs (асинхронно подключен к auth/billing/admin)
```

**10 модулей, 253 бэкенд-теста, 37 фронтенд-тестов.**

### Принципы
- **SRP** — сервисы компактные (ExperienceService, SkillService, ProjectService, LanguageService разнесены). Нет god-objects.
- **MapStruct** для типобезопасного маппинга entity→DTO.
- **Event-driven** — `ProfileUpdatedEvent` → async `VectorizationService`.
- **`LlmProvider` интерфейс + `GroqClient` реализация** — подменяемый AI-провайдер.

---

## 3. API и роутинг

- **Context path**: `/api`
- **Версионирование**: `/v1/...` (итог `/api/v1/...`)
- **Frontend `VITE_API_URL`**: origin + `/api/v1`

### Публичные эндпоинты (permitAll)
- `/v1/auth/**`, `/v1/portfolio/**`, `/v1/billing/webhook`, `/v1/billing/webhook/kaspi`, `/actuator/health`, `/oauth2/**`, `/login/oauth2/**`, `/error`

### Только ADMIN
- `/v1/admin/**` (`hasRole('ADMIN')`)

### Остальное — авторизованные
- Все остальные требуют валидный access-токен.

---

## 4. Ролевая модель и безопасность

### Роли
| Роль | Доступ |
|---|---|
| `USER` | Свой профиль, резюме, портфолио, tracker, AI (в рамках квот) |
| `ADMIN` | Всё + `/v1/admin/**` (управление юзерами, ролями, планами, аудит) |

### IDOR Protection
Безопасность строится не только на `hasRole(...)`, но и на уровне записей:
- Все эндпоинты берут userId из `SecurityUtils.getCurrentUserId()` (из JWT), **не из тела запроса**.
- Ownership-проверки: `entity.getProfile().getId().equals(profile.getId())` перед update/delete.
- Reorder дополнительно проверяет, что все переданные ID принадлежат юзеру и кол-во совпадает.

### JWT
- **Access token** (15 мин): claim `type=access`, `userId`, `role`, `deviceId`. Передаётся в `Authorization: Bearer`.
- **Refresh token** (30 дней): `type=refresh`, хранится в Redis (`refresh:{userId}:{deviceId}`) + HttpOnly cookie.
- **Type segregation**: `JwtFilter` принимает только `type=access`; refresh в Authorization блокируется.
- **Rotation**: `/auth/refresh` валидирует refresh в Redis и выдаёт новую пару.

### OAuth2 (GitHub + Google)
- `CustomOAuth2UserService` — upsert юзера, привязка providerId.
- **Code-exchange через Redis** — после логина в URL отдаётся short-lived `oauth2_code` (5 мин, single-use), который фронт обменивает на токены. Закрывает утечку access-токена в URL.
- **Link-flow** через `medev_link_jwt` cookie (5 мин, HttpOnly+Secure) для привязки провайдера к существующему юзеру.

### Шифрование
- **AES-256-GCM** (`EncryptionUtils` + `EncryptedStringConverter`) для `users.github_access_token`. IV per-encryption, tag 128 bit.
- **AES-256-ECB** (`StringCryptoConverter`) для `profiles.github_token` (мёртвая колонка, см. техдолг Epic-02).

### Rate Limiting
- `AuthRateLimiter` (Bucket4j, 20/мин на IP) — auth-эндпоинты. IP из `getRemoteAddr()`.
- `RateLimitFilter` (Bucket4j, 5/мин login, 10/час AI-parse) — IP из `X-Forwarded-For` (несогласованность, см. Epic-01 долг).
- `AiRateLimiter` (Redis, FREE=10/день, PRO=100/день) — AI-квоты с кэшем плана.

---

## 5. База данных и миграции Flyway

### Правила (обязательно)
- Схема **только** через Flyway миграции. `ddl-auto=validate`.
- Файлы: `src/main/resources/db/migration/V{N}__{description}.sql`
- **Никогда не модифицировать существующие миграции** — ломает чексуммы и деплой.
- Текущая последняя миграция: **V23** (23 скрипта).

### Основные таблицы
| Таблица | Миграция | Назначение |
|---|---|---|
| `users` | V1 + надстройки V10/V11/V14/V22/V23 | Аккаунты, планы, OAuth IDs, зашифрованный GitHub токен |
| `profiles` | V2 + V9 | 1:1 с users, секции, is_public, section_order (jsonb) |
| `experience`/`education`/`skills`/`languages`/`projects` | V3-V7 | Профильные данные с `sort_order` |
| `subscriptions` | V8 | **Мёртвая** — план в `users.plan` |
| `ai_usage`/`ai_evaluations` | V12/V13 | Token accounting + feedback |
| `job_applications` | V17 + V21 | Tracker + matching fields |
| `vector_store` | V18 | pgvector, HNSW, cosine, 384 dim |
| `audit_logs` | V19 | Аудит (готов, не wired) |
| `github_snapshots` | V20 | Composite PK (user_id, fetched_at), raw JSON |

### Никогда
- Не запускать `DROP`, `DELETE` на всю таблицу без подтверждения владельца.
- Не менять существующие миграции.

---

## 6. Архитектура фронтенда (FSD)

```
src/
├── app/          # providers (AdminGuard), layouts, router (AppRouter), ErrorBoundary
├── pages/        # auth, dashboard, profile, resume, tracker, import, portfolio, billing, admin, settings, landing
├── widgets/      # header, sidebar, portfolio, resume-builder, profile-editor
├── features/    # onboarding, ai, profile, github, billing, job-tracker, ai-assistant
├── entities/     # user, resume, profile, job-tracker (модели/сторы)
└── shared/       # api/axios, api/hooks, i18n, lib, ui
```

### Принципы
- **FSD строго**: слои app → pages → widgets → features → entities → shared. Импорты не пробивают слои вверх.
- **Code-splitting**: страницы через `React.lazy()` + Suspense.
- **Zustand (persist) для auth + React Query для server state** — разделение global vs server.
- **Axios interceptor**: авто-рефреш access при 401, queue повторных запросов, logout при failed refresh, logout при 404 на `/profile` (desynced token).
- **Strict GitHub Dark Mode**: `#0d1117`/`#161b22`/`#30363d`/`#238636`. Без glassmorphism.
- **i18next**: RU/EN.

### Роутинг и охрана
- `PrivateRoute` / `PublicRoute` — на основе `accessToken` из Zustand.
- `AdminGuard` — UI-проверка `username === 'admin'` (реальный gate — `hasRole('ADMIN')` на бэкенде).

---

## 7. AI-интеграция (Groq)

### Архитектура
- `LlmProvider` интерфейс → `GroqClient` (единственный провайдер, llama-3.1-70b-versatile).
- **Streaming (SSE)** для чата, **Structured (JSON mode)** для структурированных генераций с валидацией.
- **Resilience4j**: CircuitBreaker + Retry (4 попытки, backoff 4–20с) только для retriable (429, 5xx).

### Промпты
7 шаблонов в `resources/prompts/`, загружаются через `PromptLoader`:
`assistant_system_v1`, `resume_parser_v1`, `full_profile_generator_v1`, `onboarding_wizard_v1`, `summary_generator_v1`, `project_description_v1`, `linkedin_generator_v1`.

### Smart Merge
- **GitHub** = источник правды для языков/проектов/стека.
- **PDF** = источник правды для дат/компаний/образования.
- **Запрет галлюцинации**: если данных нет ни в одном источнике — поле остаётся `null`.
- При невалидном JSON от LLM → `RuntimeException "Aborting to prevent data loss"` (не затирает профиль).

### RAG (Vectorization)
- `VectorizationService` (event-driven, async) — embeddings профильных данных в pgvector.
- `AiApplicationService` использует RAG для cover-letter/tailor.

---

## 8. Биллинг

### Stripe (реальный)
- `StripeService` — Checkout Session (SUBSCRIPTION), webhook: checkout.session.completed (upgrade), subscription.deleted/updated (downgrade), invoice.payment_failed.
- Связка по `stripeCustomerId`.

### Kaspi Pay (mock)
- `KaspiPayService` — генерация ссылки с `orderId={userId}_{months}`. HMAC-SHA256 webhook verify.
- Устанавливает `subscriptionExpiresAt` (аддитивно).

### PRO Gate
- `SubscriptionService.assertPro` — проверяет план + `subscriptionExpiresAt`. Используется в cover-letter/tailor.

---

## 9. Связанные документы

- [ONBOARDING.md](./ONBOARDING.md) — локальный запуск
- [RUNBOOK.md](./RUNBOOK.md) — регламент эксплуатации и инцидентов
- [CONTRIBUTING.md](./CONTRIBUTING.md) — правила контрибьюта
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) — аудит безопасности
- [../AUDIT_PROJECT_REVIEW.md](../AUDIT_PROJECT_REVIEW.md) — полный обзор проекта
- [../Epics/Plan/](../Epics/Plan/) — эпики
