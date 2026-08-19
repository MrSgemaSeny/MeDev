# Security Audit — MeDev

Аудит безопасности. Дата: 2026-08-14. Только анализ, в код изменений не вносилось.

Уровни риска: `[CRITICAL]` / `[WARNING]` / `[INFO]`.

---

## Сводный риск-профиль

| Уровень | Кол-во | Статус |
|---|---|---|
| **CRITICAL** | 0 | Все ранее идентифицированные CRITICAL закрыты в аудит 1 и 2 |
| **WARNING** | 9 | Требуют точечных фиксов |
| **INFO** | 15 | Дублирование, мёртвый код, несогласованности |

Полный обзор с деталями каждой проблемы — в [../AUDIT_PROJECT_REVIEW.md](../AUDIT_PROJECT_REVIEW.md).

---

## Что сделано хорошо (green)

- **IDOR закрыт системно** через `SecurityUtils.getCurrentUserId()` + ownership-проверки на уровне записей.
- **JWT type segregation** — access vs refresh, JwtFilter принимает только `type=access`.
- **OAuth2 code-exchange через Redis** — короткий `oauth2_code` (5 мин, single-use), нет access-токена в URL.
- **HttpOnly + Secure + SameSite=Lax cookies** для refresh.
- **AES-256-GCM** (`EncryptionUtils`) для `github_access_token`. IV per-encryption, tag 128 bit.
- **SSRF-защита**: whitelist хостов + проверка loopback/private/link-local в обоих WebScraperService. AI-версия дополнительно кэширует DNS (TOCTOU).
- **PDF MIME-проверка**: content-type + magic bytes `%PDF`, лимит 10 МБ.
- **Stripe webhook signature verification**.
- **Kaspi webhook HMAC-SHA256** + constant-time compare (`MessageDigest.isEqual`).
- **CORS строгий** (через env), credentials=true.
- **CSRF отключён осознанно** (stateless JWT, no session cookie).
- **Rate limiting**: Bucket4j (auth, AI-parse) + Redis (AI-квоты).
- **Branch protection** в CI/CD (require PR + status checks).
- **Prompt injection mitigation** — `sanitize()` обрезает input (chat).
- **PiiMasker** — маскирование PII (Sprint 5).
- **Smart Merge** — запрет галлюцинации (null вместо выдумки), `Aborting to prevent data loss` при невалидном JSON.

---

## WARNING (9)

### W-1. `StringCryptoConverter` использует AES/ECB
**Файл:** `shared/security/StringCryptoConverter.java`
- ECB не использует IV — одинаковый plaintext даёт одинаковый шифротекст. Применяется к `Profile.githubToken` (мёртвая колонка).
- Берёт ключ из `crypto.secret`, который **не определён** ни в одном application*.yml → дефолт `default1234567890secret1234567890`.
- При этом `EncryptedStringConverter` (для `User.githubAccessToken`) использует AES/GCM — корректно. Два конвертера с разным уровнем безопасности.

### W-2. Дублирующие ключи шифрования
- `encryption.secret` (GCM-конвертер) и `crypto.secret` (ECB-конвертер) — два независимых секрета, оба с захардкоженными дефолтами в dev-профиле. В prod `crypto.secret` не передаётся из env → ECB-конвертер падает на дефолт.

### W-3. Stripe webhook без idempotency
- `StripeService.handleWebhook` верифицирует подпись, но не хранит event-id. Дубликат (replay) обработается повторно (идемпотентен по плану, но логирует шумно).

### W-4. Admin dashboard заглушки
- `AdminService.getDashboardStats`: `proUsers=0`, `totalAiTokensUsedToday=0`. Реальные агрегации не реализованы.

### W-5. AuditService не вызывается
- Модуль audit полностью реализован, но `AuditService.logAction` нигде не вызывается. Аудит-логи пусты.

### W-6. Kaspi orderId user-controlled
- `KaspiPayService.handleWebhook`: `orderId={userId}_{months}` — user-controlled поле в генерируемой ссылке. При скомпрометированном `secretKey` — privilege escalation любого userId до PRO.

### W-7. `match-job` без assertPro
- `POST /v1/ai/match-job` НЕ вызывает `SubscriptionService.assertPro` — FREE-юзер может матчить. PRO-gate непоследователен (cover-letter/tailor требуют PRO).

### W-8. ResumeController инвертированная PRO-проверка
- `if (template.toLowerCase().contains("pro")) throw UnauthorizedException` — блокирует шаблоны С "pro" в имени для ВСЕХ (включая PRO). Должно: блокировать если юзер НЕ PRO. Шаблоны с "pro" физически недоступны.

### W-9. Гонка в importProjects
- `ProfileService.updateFromGitHub`/`importProjects` НЕ используют `findByUserIdForUpdate` (pessimistic lock), в отличие от `importParsedResume`. Ручная дедупликация "in case of previous race conditions" — сигнал прошлой гонки.

---

## INFO (15)

- **I-1.** `parse-resume` создаёт InputStream без try-with-resources при раннем return.
- **I-2.** `NetworkAddressCache` — глобальный side-effect (ai/WebScraperService ставит `networkaddress.cache.ttl=30` на всю JVM).
- **I-3.** `RateLimitFilter` использует `X-Forwarded-For` (в отличие от AuthRateLimiter/AuthController) — несогласованность IP-резолва.
- **I-4.** AI `sanitize()` только для chat; structured-эндпоинты передают jobDescription без лимита.
- **I-5.** `AdminGuard` на фронте проверяет `username === 'admin'`, а не `role === 'ADMIN'`.
- **I-6.** Мёртвая таблица `subscriptions` (V8) — план в `users.plan`.
- **I-7.** Мёртвая колонка `profiles.github_token` (ECB-конвертер) — токен в `users.github_access_token`.
- **I-8.** `RedisTemplate<String,Object>` смешивает сериализаторы (GenericJackson2Json для Object-template, StringRedisTemplate для auth).
- **I-9.** Stripe не устанавливает `subscriptionExpiresAt` (бессрочная подписка); Kaspi устанавливает — несогласованная модель.
- **I-10.** `GitHubService.fetchUserPublicRepos` тянет без токена (публичные 10 шт) — теряет приватные проекты.
- **I-11.** `ServerPortCustomizer` сканирует порты 8080–8083 — race в Docker/CI.
- **I-12.** JSON-cleaning дублируется в `GroqClient` и `AiAnalysisService`.
- **I-13.** `max_tokens=2048` фиксирован — обрезает длинные генерации.
- **I-14.** `structuredCompletion` использует `.block()` — упрётся в thread pool.
- **I-15.** Фронтенд-тесты не запускаются в CI (`ci.yml` только build).

---

## Рекомендации (без изменений в коде)

1. Унифицировать шифрование: удалить `StringCryptoConverter` (ECB) или перевести на GCM; убрать мёртвый `Profile.githubToken`.
2. Wire `AuditService.logAction` в auth/billing/plan-change потоки.
3. Реализовать `AdminService.getDashboardStats` (countByPlan, tokens today).
3. Добавить `assertPro` в `match-job`.
4. Инвертировать PRO-проверку в `ResumeController`.
5. Kaspi: убрать userId из user-controlled orderId или подписывать payload целиком.
6. Добавить `npm test` в `ci.yml`.
7. Унифицировать IP-резолв в `RateLimitFilter` (убрать `X-Forwarded-For`).
8. AI `sanitize()` для всех structured-эндпоинтов.
9. Вынести JSON-cleaning в одно место.
10. Удалить мёртвую таблицу `subscriptions` (новой миграцией).

---

*Аудит подготовлен как read-only обзор. В код изменений не вносилось.*
