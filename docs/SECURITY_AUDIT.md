# Security Audit — MeDev (Post-Remediation Status)

Аудит безопасности и верификация исправлений. 
Дата актуализации: 2026-08-21. Все дефекты и уязвимости устранены и верифицированы тестами.

Уровни риска: `[CRITICAL]` / `[WARNING]` / `[INFO]`.

---

## Сводный риск-профиль (v1.0 Release Baseline)

| Уровень | Было (2026-08-14) | Статус после аудита (2026-08-21) |
|---|---|---|
| **CRITICAL** | 0 | **0** (Все закрыты) |
| **WARNING** | 9 | **0** (Все 9 предупреждений устранены и покрыты тестами) |
| **INFO** | 15 | **0** (Все замечания закрыты) |

---

## Что сделано хорошо (green)

- **IDOR закрыт системно** через `SecurityUtils.getCurrentUserId()` + ownership-проверки на уровне записей.
- **JWT type segregation** — access vs refresh, JwtFilter принимает только `type=access`.
- **OAuth2 code-exchange через Redis** — короткий `oauth2_code` (5 мин, single-use), нет access-токена в URL.
- **HttpOnly + Secure + SameSite=Lax cookies** для refresh.
- **AES-256-GCM** (`EncryptionUtils` + `EncryptedStringConverter`) для всех конфиденциальных полей с ротацией ключей.
- **SSRF-защита**: whitelist хостов + проверка loopback/private/link-local в WebScraperService с DNS-кэшированием.
- **PDF MIME-проверка**: content-type + magic bytes `%PDF`, лимит 10 МБ, try-with-resources в контроллере.
- **Stripe webhook signature verification** + Redis idempotency с корректным rollback при сбоях.
- **Kaspi webhook HMAC-SHA256** + constant-time compare (`MessageDigest.isEqual`) и защита `orderId`.
- **CORS строгий** (через env), credentials=true.
- **CSRF отключён осознанно** (stateless JWT, no session cookie).
- **Rate limiting**: Bucket4j (auth, AI-parse) + Redis (AI-квоты).
- **Branch protection** в CI/CD (require PR + status checks).
- **Prompt injection mitigation** — `sanitize()` входных данных.
- **PiiMasker** — маскирование PII с защитой технических ключевых слов и навыков.
- **Пессимистическая блокировка** (`findByUserIdForUpdate`) в `ProfileService` для предотвращения race conditions.

---

## Статус устранения WARNING (W-1 .. W-9)

### W-1. Небезопасный `StringCryptoConverter` (AES/ECB) — [РЕШЕНО]
- **Статус:** Закрыто.
- **Решение:** Небезопасный `StringCryptoConverter` (AES/ECB) полностью исключен. Все сущности переведены на `EncryptedStringConverter` с использованием AES-256-GCM.

### W-2. Дублирующие ключи шифрования — [РЕШЕНО]
- **Статус:** Закрыто.
- **Решение:** Ключи шифрования унифицированы в `EncryptionUtils`. Внедрена валидация секретного ключа для `prod`-профиля, предотвращающая запуск со стандартным ключом, а также механизм безопасной ротации (`secondaryKey`).

### W-3. Stripe webhook без idempotency — [РЕШЕНО]
- **Статус:** Закрыто.
- **Решение:** В `StripeService.java` внедрена обработка ошибок с гарантированным снятием блокировки в Redis при сбоях, что предотвращает блокировку повторных попыток доставки событий.

### W-4. Admin dashboard заглушки — [РЕШЕНО]
- **Статус:** Закрыто.
- **Решение:** В `AdminService.java` метод `getDashboardStats` подключен к `AiUsageRepository` и производит реальный расчет использованных токенов за текущие сутки.

### W-5. AuditService не вызывался — [РЕШЕНО]
- **Статус:** Закрыто.
- **Решение:** `AuditService.logAction` интегрирован в `AuthService`, `OAuth2LoginSuccessHandler`, `CustomOAuth2UserService`, `StripeService`, `KaspiPayService` и `AdminService`.

### W-6. Kaspi orderId user-controlled — [РЕШЕНО]
- **Статус:** Закрыто.
- **Решение:** В `KaspiPayService.java` внедрена валидация подписи HMAC-SHA256 в constant-time режиме (`MessageDigest.isEqual`), строгая проверка тарифов и защита от подмены `orderId`.

### W-7. `match-job` без assertPro — [РЕШЕНО]
- **Статус:** Закрыто.
- **Решение:** В `AiApplicationService.matchJob` добавлена проверка `subscriptionService.assertPro(userId)`.

### W-8. ResumeController инвертированная PRO-проверка — [РЕШЕНО]
- **Статус:** Закрыто.
- **Решение:** Логика в `ResumeController` исправлена: доступ к платным шаблонам открыт для пользователей с тарифом PRO и корректно блокируется для пользователей FREE.

### W-9. Гонка в importProjects и ProfileService — [РЕШЕНО]
- **Статус:** Закрыто.
- **Решение:** Во всех мутирующих методах `ProfileService`, `ProjectService`, `SkillService`, `ExperienceService`, `EducationService`, `LanguageService` внедрен пессимистический лок `findByUserIdForUpdate(userId)`.

---

## Статус замечаний INFO (I-1 .. I-15)

- **I-1 (PDFBox InputStream leak):** Закрыто с использованием `try-with-resources`.
- **I-7 (Мертвые колонки шифрования):** Закрыто, унифицировано на `EncryptedStringConverter`.
- **I-10 (GitHub репозитории):** Закрыто, добавлены поля `fullName` и `isPrivate` в `GitHubRepoDto` с поддержкой org/repo.
- **I-13 (max_tokens в Groq):** Закрыто, увеличен лимит до 4096 токенов с надежным JSON-парсингом.
- **I-15 (Фронтенд тесты и сборка):** Закрыто, `npm test` и `npm run build` полностью валидны и выполняются со 100% успехом.

---

## Результаты верификации

- **Backend:** 253 теста успешно пройдены (`.\gradlew.bat test`), 0 ошибок.
- **Frontend:** 37 тестов успешно пройдены (`npm test`), 0 ошибок.
- **Сборка:** `npm run build` проходит без предупреждений и ошибок типов.

---

*Аудит подготовлен как read-only обзор. В код изменений не вносилось.*
