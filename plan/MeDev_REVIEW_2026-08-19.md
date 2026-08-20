# MeDev — полный технический обзор

Дата: 2026-08-19 · Ревизия: `b7803b8` (main) · Автор обзора: Devin

Проверено: архитектура, безопасность, БД/миграции, биллинг, AI-слой, фронтенд, CI/CD, тесты.
Сборка и тесты запускались локально (JDK 17, Node 22).

---

## 1. Краткий вывод

Проект зрелый для pet/pre-seed стадии: чистая модульная структура на бэкенде, FSD на фронте,
84 бэкенд-теста + 37 фронтенд-тестов, миграции Flyway (V1–V23), CI, Docker, аудит-логи, rate limiting,
шифрование чувствительных полей. Это заметно выше среднего уровня «портфолио-проекта».

Но к продакшену он не готов по трём группам причин:

1. **CI красный на main уже 3 коммита подряд** — `./gradlew build` падает (интеграционный тест требует живой Postgres).
2. **Есть реальные дыры в безопасности и биллинге**, главные — привязка OAuth-аккаунта по непроверенному email
   (потенциальный захват аккаунта) и полностью замоканный Kaspi Pay при рабочем webhook-эндпоинте.
3. **Задеплоенный фронтенд нерабочий**: GitHub Pages собирается без `VITE_API_URL`, т.е. ходит на `http://localhost:8080`.

Оценка по областям (1–5):

| Область | Оценка | Комментарий |
|---|---|---|
| Архитектура бэкенда | 4 | Чистый модульный монолит, границы модулей соблюдены |
| Безопасность | 2.5 | Хорошая база (JWT-типизация, шифрование, CORS), но есть P0/P1-дыры |
| Биллинг | 2 | Stripe норм, Kaspi — мок в проде, нет идемпотентности вебхуков |
| AI-слой | 3.5 | Circuit breaker, retry, квоты — но модель Groq устаревшая, VectorStore — заглушка |
| Фронтенд | 3.5 | FSD, lazy-роуты, тесты; но токен в localStorage и фейковый AdminGuard |
| Тесты | 3 | 84 теста, но покрытие неравномерное: биллинг/AI/tracker почти не покрыты |
| CI/CD | 2 | Красный main, нет линта/тестов фронта в CI, нет прогона миграций |
| Документация | 4 | README, ARCHITECTURE, RUNBOOK, эпики — сильная сторона (местами расходится с кодом) |

---

## 2. Что сделано хорошо

- **Границы модулей.** `modules/{auth,profile,github,ai,portfolio,resume,billing,tracker,admin,audit}` +
  `shared/` — реальный модульный монолит, а не «сервисы в куче».
- **JWT-гигиена.** Разделение `type=access|refresh` (`JwtService`), проверка типа в `JwtFilter`,
  refresh привязан к `deviceId` и валидируется против Redis, ротация при refresh, logout убивает только своё устройство.
- **Шифрование секретов пользователей.** AES/GCM + поддержка ротации ключа (`ENCRYPTION_SECRET_OLD`),
  fail-fast при дефолтном ключе в профиле `prod` (`EncryptionUtils.init`).
- **Resilience в AI.** Circuit breaker + retry + таймауты в `GroqClient`, структурированные ошибки в SSE,
  человеко-читаемые сообщения на фронт.
- **Публичное портфолио закрыто корректно.** `PortfolioService` отдаёт 404 при `isPublic=false` — IDOR нет.
- **Аудит-логи и admin-модуль** с пагинацией и запретом менять собственную роль.
- **Документация и планирование** (`docs/`, `Epics/`, `MEDEV_ROADMAP.md`, journal) — редкость для проектов такого размера.

---

## 3. Блокеры (P0) — чинить в первую очередь

### P0-1. CI на main красный, `./gradlew build` падает
`ResumeTemplateIntegrationTest` помечен `@SpringBootTest(classes = MeDevApplication.class)` без Testcontainers
и без профиля `test`, поэтому поднимает полный контекст и Flyway идёт в реальный Postgres → `ConnectException`.
Локально: `84 tests completed, 1 failed`. В GitHub Actions — та же ошибка (runs 32225923042, 32224895566, 32000097547).

Фикс: тест рендерит только Thymeleaf-шаблоны, ему не нужен контекст Spring целиком — либо
`@SpringBootTest` заменить на unit-тест с самостоятельно собранным `SpringTemplateEngine` + `ClassLoaderTemplateResolver`,
либо унаследовать от `AbstractIntegrationTest` (Testcontainers уже настроены).
Файл: `backend/src/test/java/com/medev/modules/resume/service/ResumeTemplateIntegrationTest.java`.

### P0-2. Захват аккаунта через OAuth-привязку по непроверенному email
`CustomOAuth2UserService.loadUser` (строка ~102) ищет пользователя `findByEmail(finalEmail)` и **привязывает**
OAuth-провайдера к найденному аккаунту, а затем **перезатирает пароль** случайным значением
(«Fix Pre-Account Creation vulnerability»).

Проблемы:
- Для GitHub берётся `attributes.get("email")` — это **публичный профильный email**, GitHub его не верифицирует
  на предмет владения при отдаче в профиле. Скоуп `user:email` запрошен, но верифицированные адреса через
  `/user/emails` не читаются.
- Для Google не проверяется `email_verified`.
- Побочный эффект: легитимный пользователь с паролем теряет доступ (пароль перезаписан) после чужого OAuth-логина.

Фикс: для GitHub тянуть `GET /user/emails` и брать только `primary && verified`; для Google требовать
`email_verified == true`; автоматическую привязку к существующему паролю-аккаунту заменить на явный flow
(«войдите паролем и подтвердите привязку»), а пароль не трогать.

### P0-3. Kaspi Pay — мок, но webhook живой и повышает план
`KaspiPayService.createPaymentLink` возвращает захардкоженный URL `https://pay.kaspi.kz/pay/{merchantId}?...`,
реального вызова API нет; суммы (`40000`, `75000`) захардкожены в коде. При этом
`POST /v1/billing/webhook/kaspi` открыт публично и по валидной HMAC-подписи выдаёт PRO.
В `application.yml` дефолт `kaspi.secret-key: dummy-secret-key`, и `verifySignature` его **не** отклоняет
(в чёрном списке только `changeme` и `test`) — то есть при забытой переменной окружения подпись предсказуема
и PRO выдаётся кому угодно.

Фикс минимум: отключать Kaspi-эндпоинты фича-флагом, пока нет интеграции, и падать на старте, если
`kaspi.secret-key` равен дефолту в проде (как уже сделано в `EncryptionUtils`).

### P0-4. Продакшн-фронтенд смотрит на localhost
`.github/workflows/deploy.yml` собирает фронт без `VITE_API_URL`, а дефолт —
`http://localhost:8080/api/v1` (`frontend/src/shared/api/axios.ts:6`, плюс дубли в `LoginPage`, `RegisterPage`, `GithubImport`).
Дополнительно `createBrowserRouter` на GitHub Pages даст 404 при прямом заходе на `/dashboard` (нужен SPA-fallback `404.html`).

---

## 4. Высокий приоритет (P1)

### P1-1. Обход rate limit подменой заголовка
`RateLimitFilter.getClientIpAddress` (строка 63) доверяет `X-Forwarded-For` без списка доверенных прокси —
лимит обходится одной строкой заголовка. Иронично, что в `AuthController.getClientIp` тот же вопрос решён
правильно (`getRemoteAddr` + `forward-headers-strategy`). Привести фильтр к тому же подходу.

### P1-2. «PRO-гейт» на шаблонах резюме — фикция
`ResumeController` (строки 22 и 39) проверяет `template.toLowerCase().contains("pro")` и **никогда** не смотрит на план
пользователя. То есть: платные шаблоны не защищены, а любой шаблон со словом «pro» в имени недоступен вообще никому.
Нужна проверка `user.getPlan() == PRO` + белый список имён шаблонов.

### P1-3. Имя шаблона из URL идёт прямо в шаблонизатор
`PdfGeneratorService:95` и `:155`: `templateEngine.process("resume/" + templateName, context)` без валидации.
Это позволяет отрендерить любой шаблон из classpath (`../profile/...`) и получить 500 на произвольном вводе.
Фикс: `Set.of("apple-modern","github","grok-monolith","milky-soft","phub-orange")` и 400 на всё остальное.

### P1-4. Access token в localStorage
`entities/user/model/store.ts` персистит `accessToken` через `zustand/persist` (localStorage), плюс остался
мёртвый код `localStorage.setItem('refreshToken', ...)`, хотя refresh уже в HttpOnly-cookie.
Любой XSS = угон сессии. Правильнее держать access-токен в памяти и восстанавливать по refresh-cookie при загрузке.
Заодно: бэкенд всё ещё возвращает `refreshToken` в теле `AuthResponse` — это сводит на нет смысл HttpOnly-cookie.

### P1-5. AdminGuard проверяет username, а не роль
`frontend/src/app/providers/AdminGuard.tsx:12`: `if (username !== 'admin')`. При этом `admin` — зарезервированное
имя (`AuthService.RESERVED_USERNAMES`), т.е. настоящий администратор с другим username в админку не попадёт,
а сама проверка ничего не защищает (бэкенд, к счастью, требует `ROLE_ADMIN`). Нужно класть `role` в `AuthResponse`
и в стор, и проверять его.

### P1-6. Устаревшая модель Groq
`GroqClient:35-36` — `llama-3.1-70b-versatile`. Эта модель у Groq выведена из эксплуатации (актуальная линейка —
`llama-3.3-70b-versatile`), т.е. все AI-фичи, вероятно, отвечают 400/404 в проде. Модель стоит вынести в конфиг,
а не хардкодить в двух константах.

### P1-7. Конфликт конфигурации Stripe между профилями
Код читает `stripe.api-key` (`StripeConfig`, `StripeService:34`), но `application-prod.yml` объявляет
`stripe.secret-key: ${STRIPE_SECRET_KEY}` без дефолта. Итог: в проде приложение упадёт на старте без
`STRIPE_SECRET_KEY`, который при этом **нигде не используется**, а реальный ключ придёт из `STRIPE_API_KEY`.
Плюс дефолт `sk_test_12345` в `application.yml` молча уедет в прод, если переменную забыть.

### P1-8. Нет идемпотентности вебхуков Stripe
`StripeService.handleWebhook` не хранит обработанные `event.id`. Повторная доставка (норма для Stripe)
приведёт к повторному апгрейду/даунгрейду. Также `invoice.payment_failed` немедленно роняет план в FREE,
без grace period — жёстко для реального продукта.

---

## 5. Средний приоритет (P2)

- **VectorStore — заглушка.** `MockVectorStoreConfig` возвращает no-op бин, `VectorizationService` при этом
  честно чистит таблицу `vector_store` и «сохраняет» документы в никуда. Миграция V18 создаёт pgvector-таблицу,
  которая не используется. Либо доделать, либо убрать модуль и зависимость `spring-ai-core` (BOM `1.0.0-M1` — milestone).
- **Bucket4j объявлен, но не используется.** В `build.gradle` есть `bucket4j-core` и `bucket4j-redis`, в коде — 0 вхождений;
  лимиты сделаны вручную на `INCR`+`EXPIRE`. README при этом обещает Bucket4j. Убрать зависимость или перейти на неё.
- **Гонка в счётчиках лимитов.** Пара `increment` + `expire` не атомарна: при падении между вызовами ключ
  останется без TTL и пользователь будет забанен навсегда. Лечится Lua-скриптом или `SET NX EX` + `INCR`.
- **Кэш плана на 15 минут** (`AiRateLimiter.getUserDailyLimit`) — после оплаты PRO лимиты подтянутся не сразу.
  Инвалидировать `user_plan:{id}` в вебхуках биллинга.
- **`(Integer) redisTemplate.opsForValue().get(key)`** в `AiRateLimiter` и `PdfGeneratorService` — хрупкое приведение
  типа поверх JSON-сериализатора; при значении > `Integer.MAX_VALUE` или смене сериализатора получите `ClassCastException`.
  Для счётчиков заведите отдельный `StringRedisTemplate`.
- **Блокирующая загрузка аватара внутри генерации PDF** (`fetchAvatarBase64`, `HttpURLConnection` без таймаутов) —
  внешний HTTP в синхронном запросе: залипший github.com = залипший тред.
- **Неравномерное покрытие тестами.** 22 тест-класса на 166 классов; `tracker`, `admin`(частично), `billing`(1 тест),
  `KaspiPayService`, `RateLimitFilter`, OAuth-flow не покрыты вовсе — а это как раз самые рискованные места.
- **CI не проверяет фронт полностью**: только `npm run build`, без `npm run lint` и `npm test` (37 тестов не гоняются).
  Бэкенд-джоб не запускает миграции против чистой БД.
- **`node-version: '20'` в CI** — сборка держится на том, что runner ставит 20.19+; локально на Node 20.18
  `npm ci` молча пропускает нативные биндинги rolldown/oxlint и `npm run build`/`lint`/`test` падают.
  Стоит зафиксировать `node-version: '22'` и добавить `engines` в `package.json`.
- **Dependabot ломится в мажоры** (Spring Boot 4.1.0) и его PR стабильно красные — настроить `ignore` мажоров
  в `dependabot.yml`, иначе шум.

---

## 6. Гигиена репозитория

- `.idea/` закоммичен, хотя в `backend/.gitignore` он исключён (корневой `.gitignore` — всего 5 строк про `.env`).
- В корне лежат артефакты и одноразовые скрипты: `Inter.zip` (194 КБ), `fix_templates.py`, `test_xml.py`,
  `frontend/fix_ts.cjs`, `frontend/fix-imports.cjs`, `frontend/redesign.cjs`, `backend/Roboto-Regular.b64`,
  `backend/inject_fonts.js`, `backend/download_full_fonts.js`.
- Дублирование конфигов: `stripe.*` описан по-разному в трёх yml; секреты-плейсхолдеры (`sk_test_12345`,
  `dummy-secret-key`, дефолтный JWT-секрет в `application-dev.yml`) — терпимо для dev, опасно как дефолт.
- `.agents/hooks.json` завязан на `powershell.exe` — на Linux/macOS-агентах и в CI хуки просто не сработают.
- Отсутствует `.pre-commit-config.yaml`/`husky` — линт и тесты держатся только на дисциплине.

---

## 7. Результаты локальной проверки

| Проверка | Результат |
|---|---|
| `./gradlew build` (JDK 17) | FAIL — 84 теста, 1 упал (`ResumeTemplateIntegrationTest`), 1 skipped |
| `npm ci` на Node 20.18 | FAIL — нативные биндинги rolldown/oxlint не ставятся (engines `^20.19 \|\| >=22.12`) |
| `npm run build` (Node 22) | OK — 605 мс, главный чанк 405 КБ (127 КБ gzip) |
| `npm run lint` (Node 22) | OK — 5 warnings (unused catch-параметры, exhaustive-deps в `AiChatWidget`) |
| `npm test` (Node 22) | OK — 9 файлов, 37 тестов |
| GitHub Actions, main | 3 последних прогона `MeDev CI/CD` — failure (тот же тест) |

---

## 8. Предлагаемый порядок работ

**Спринт 1 (день–два, разблокировать main и прод):**
1. Починить `ResumeTemplateIntegrationTest` → зелёный CI.
2. Прокинуть `VITE_API_URL` в `deploy.yml` + SPA-fallback для Pages.
3. Обновить модель Groq и вынести её в конфиг.
4. Привести конфиг Stripe к одному ключу, добавить fail-fast на дефолтные секреты в проде.

**Спринт 2 (безопасность):**
5. OAuth: верифицированные email, явная привязка аккаунтов, не трогать пароль.
6. Kaspi за фича-флагом + fail-fast на дефолтном ключе.
7. `X-Forwarded-For` → доверенные прокси; белый список шаблонов резюме; реальный PRO-гейт.
8. Access-token в память, `role` в `AuthResponse`, AdminGuard по роли.

**Спринт 3 (устойчивость и качество):**
9. Идемпотентность вебхуков Stripe + grace period.
10. Атомарные лимиты (Lua), инвалидация кэша плана.
11. Тесты на billing/tracker/OAuth; `lint` и `test` фронта в CI; Node 22.
12. Решить судьбу pgvector/spring-ai и Bucket4j; вычистить мусор из репозитория.
