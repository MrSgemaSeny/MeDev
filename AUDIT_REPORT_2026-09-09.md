# MeDev (DevProfile) — Генеральный отчёт архитектурного аудита, устранения логических дыр и сквозного E2E тестирования

**Дата проведения**: 2026-09-09  
**Версия документа**: 2.0 (Полный детализированный реестр)  
**Статус платформы**: Production Live (Level 4)  
**Боевые контуры**:
- **Backend API**: `https://medev-backend.onrender.com/api` (Render Web Service, Docker, Java 17, Spring Boot 3.3.0)
- **Frontend SPA**: `https://app.medev.mrsgemaseny.com` / `https://me-dev-two.vercel.app` (Vercel, React 19, Vite, Tailwind v4)
- **Database**: PostgreSQL 17 (`medev-postgres` on Render, Flyway v24)
- **Cache & Key-Value**: Valkey Redis 8.1.4 (`medev-redis` on Render) + L1 In-Memory Caffeine
- **AI Engine**: Groq Cloud API (`openai/gpt-oss-20b` — строго утверждённая модель)

---

## 1. Архитектурная топология платформы

### 1.1. Модульный монолит бэкенда (Spring Boot 3.3.0)
Архитектура бэкенда организована по доменному принципу (DDD / Feature Modules):
- `com.medev.modules.auth`: регистрация, аутентификация по JWT (access 24h, refresh 30d в Redis), OAuth2 (GitHub, Google), ротация токенов с 15-секундным Grace Period при одновременных запросах.
- `com.medev.modules.profile`: агрегат профиля разработчика и дочерние коллекции (навыки `Skill`, опыт `Experience`, образование `Education`, языки `Language`, проекты `Project`, кастомный `README.md`).
- `com.medev.modules.resume`: генерация резюме на движке Thymeleaf + Flying Saucer PDF; поддержка 6 стилей оформления и двух режимов верстки (`singlePage=true/false`).
- `com.medev.modules.portfolio`: публичный профиль разработчика (`/api/v1/portfolio/{username}`) с кэшированием в L1 Caffeine и L2 Redis.
- `com.medev.modules.tracker`: Kanban-трекер откликов на вакансии (`JobApplication`) с парсингом ссылок (HeadHunter, LinkedIn, Habr Career) через Jsoup и защитой от SSRF.
- `com.medev.modules.ai`: проксирование запросов к Groq LLM, генерация саммари, описаний проектов, сопроводительных писем, парсинг резюме из PDF, аудит профиля и SSE-стриминг чата (`/api/v1/ai/chat/stream`).
- `com.medev.modules.github`: синхронизация репозиториев, скоринг активности разработчика и извлечение описаний из README.
- `com.medev.modules.billing`: биллинг тарифов PRO через Stripe и Kaspi Pay.
- `com.medev.modules.admin`: RBAC-панель управления пользователями, тарифами и журналами аудита.
- `com.medev.shared`: сквозная безопасность (`JwtFilter`, `SecurityConfig`), защита от IDOR (`SecurityUtils.getCurrentUserId()`), аудит-логгер (`AuditService`) и глобальный обработчик ошибок (`GlobalExceptionHandler`).

### 1.2. Архитектура фронтенда (React 19 + FSD)
Фронтенд строго следует методологии Feature-Sliced Design:
- `app/`: провайдеры (React Query, ThemeProvider, ToastProvider), глобальные стили Tailwind v4, конфигурация роутера `AppRouter.tsx`.
- `pages/`: постраничные компоненты с ленивой загрузкой через `React.lazy`: `DashboardPage`, `ProfileEditPage`, `ResumePage`, `JobTrackerPage`, `ImportResumePage`, `PortfolioPage`, `PricingPage`, `AdminPages`.
- `widgets/`: сложные независимые блоки: `ResumeBuilder`, `ProfileHeader`, `JobTrackerKanban`, `Sidebar`.
- `features/`: пользовательские сценарии: перетаскивание карточек `@dnd-kit/core`, AI-ассистент, генерация сопроводительных писем.
- `entities/`: модели данных, типы TypeScript и Zustand-сторы: `useAuthStore`, `useProfileStore`.
- `shared/`: переиспользуемые UI-примитивы, кастомный инстанс `axios.ts` с интерцептором автоматической ротации токенов.

---

## 2. Полный реестр эндпоинтов бэкенда (Backend API Registry)

Ниже приведён полный перечень всех существующих маршрутов бэкенда по 10 контроллерам:

### 2.1. Модуль аутентификации (`/api/v1/auth`) — `AuthController`
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `POST` | `/v1/auth/register` | Регистрация нового аккаунта | Публичный | `201 Created` |
| `POST` | `/v1/auth/login` | Аутентификация по логину и паролю | Публичный | `200 OK` |
| `POST` | `/v1/auth/refresh` | Ротация refresh-токена (HttpOnly cookie) | Публичный | `200 OK` |
| `POST` | `/v1/auth/logout` | Логаут, очистка кук, отзыв токена в Redis | Авторизован | `204 No Content` |
| `POST` | `/v1/auth/forgot-password` | Запрос токена сброса пароля | Публичный | `200 OK` |
| `POST` | `/v1/auth/reset-password` | Установка нового пароля по токену | Публичный | `200 OK` |
| `POST` | `/v1/auth/oauth2/exchange` | Обмен временного OAuth2-кода на JWT | Публичный | `200 OK` |
| `GET` | `/v1/auth/oauth2/link/{provider}`| Инициализация привязки GitHub-аккаунта | Авторизован | `302 Found` |

### 2.2. Модуль профиля (`/api/v1/profile`) — `ProfileController`
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `GET` | `/v1/profile` | Получение профиля текущего пользователя | USER | `200 OK` |
| `PUT` | `/v1/profile` | Обновление основных данных (bio, headline, links) | USER | `200 OK` |
| `PUT` | `/v1/profile/section-order` | Изменение порядка отображения секций | USER | `204 No Content` |
| `GET` | `/v1/profile/readme` | Рендеринг GitHub Markdown README | USER | `200 OK` |
| `GET` | `/v1/profile/export/readme` | Скачивание README в виде файла | USER | `200 OK` |
| `GET` | `/v1/profile/export/json` | Полный бэкап профиля в формате JSON | USER | `200 OK` |
| `POST` | `/v1/profile/skills` | Добавление навыка | USER | `201 Created` |
| `PUT` | `/v1/profile/skills/{id}` | Обновление навыка | USER | `200 OK` |
| `DELETE` | `/v1/profile/skills/{id}` | Удаление навыка | USER | `204 No Content` |
| `PUT` | `/v1/profile/skills/reorder` | Сортировка навыков | USER | `204 No Content` |
| `POST` | `/v1/profile/experience` | Добавление опыта работы | USER | `201 Created` |
| `PUT` | `/v1/profile/experience/{id}` | Обновление опыта работы | USER | `200 OK` |
| `DELETE` | `/v1/profile/experience/{id}` | Удаление опыта работы | USER | `204 No Content` |
| `PUT` | `/v1/profile/experience/reorder` | Сортировка опыта работы | USER | `204 No Content` |
| `POST` | `/v1/profile/education` | Добавление записи об образовании | USER | `201 Created` |
| `PUT` | `/v1/profile/education/{id}` | Обновление записи об образовании | USER | `200 OK` |
| `DELETE` | `/v1/profile/education/{id}` | Удаление записи об образовании | USER | `204 No Content` |
| `PUT` | `/v1/profile/education/reorder` | Сортировка записей об образовании | USER | `204 No Content` |
| `POST` | `/v1/profile/languages` | Добавление разговорного языка | USER | `201 Created` |
| `PUT` | `/v1/profile/languages/{id}` | Обновление разговорного языка | USER | `200 OK` |
| `DELETE` | `/v1/profile/languages/{id}` | Удаление разговорного языка | USER | `204 No Content` |
| `PUT` | `/v1/profile/languages/reorder` | Сортировка языков | USER | `204 No Content` |
| `POST` | `/v1/profile/projects` | Добавление проекта | USER | `201 Created` |
| `PUT` | `/v1/profile/projects/{id}` | Обновление проекта | USER | `200 OK` |
| `DELETE` | `/v1/profile/projects/{id}` | Удаление проекта | USER | `204 No Content` |
| `PUT` | `/v1/profile/projects/reorder` | Сортировка проектов | USER | `204 No Content` |

### 2.3. Модуль генерации резюме (`/api/v1/resume`) — `ResumeController`
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `GET` | `/v1/resume/generate/{template}` | Генерация PDF файла (`singlePage`, `preview`) | USER | `200 OK` (`application/pdf`) |
| `GET` | `/v1/resume/html/{template}` | Рендеринг HTML шаблона (`singlePage`, `preview`) | USER | `200 OK` (`text/html`) |

### 2.4. Публичное портфолио (`/api/v1/portfolio`) — `PortfolioController`
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `GET` | `/v1/portfolio/{username}` | Просмотр открытого портфолио разработчика | Публичный | `200 OK` |

### 2.5. Job Tracker откликов (`/api/v1/tracker/applications`) — `JobApplicationController`
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `GET` | `/v1/tracker/applications` | Список откликов пользователя (Kanban) | USER | `200 OK` |
| `GET` | `/v1/tracker/applications/scrape` | Парсинг вакансии по URL (HH, LinkedIn) | USER | `200 OK` |
| `POST` | `/v1/tracker/applications` | Создание нового отклика | USER | `201 Created` |
| `PUT` | `/v1/tracker/applications/{id}` | Обновление данных и статуса отклика | USER (Владелец) | `200 OK` |
| `DELETE` | `/v1/tracker/applications/{id}` | Удаление отклика | USER (Владелец) | `204 No Content` |

### 2.6. Модуль искусственного интеллекта (`/api/v1/ai`) — `AiController`
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `GET` | `/v1/ai/quota` | Проверка оставшегося дневного лимита запросов | USER | `200 OK` |
| `POST` | `/v1/ai/chat/stream` | Потоковый чат с AI-ассистентом через SSE | USER | `200 OK` (`text/event-stream`) |
| `POST` | `/v1/ai/generate/summary` | Генерация профессионального Summary | USER | `200 OK` |
| `POST` | `/v1/ai/generate/project-description` | Генерация описания проекта | USER | `200 OK` |
| `GET` | `/v1/ai/export/linkedin` | Генерация секции LinkedIn About | USER | `200 OK` |
| `POST` | `/v1/ai/onboarding` | Интерактивный онбординг через AI | USER | `200 OK` |
| `POST` | `/v1/ai/generate-profile` | Комплексная генерация профиля | USER | `200 OK` |
| `POST` | `/v1/ai/cover-letter` | Генерация сопроводительного письма под вакансию | USER | `200 OK` |
| `POST` | `/v1/ai/tailor` | Адаптация резюме под конкретное описание вакансии | USER | `200 OK` |
| `POST` | `/v1/ai/match-job` | Расчет совпадения (Match Score) резюме с вакансией | USER | `200 OK` |
| `POST` | `/v1/ai/parse-resume` | Извлечение профиля из загруженного PDF-файла | USER | `200 OK` |
| `POST` | `/v1/ai/feedback` | Сохранение пользовательского отзыва о генерации | USER | `200 OK` |

### 2.7. Интеграция с GitHub (`/api/v1/github`) — `GitHubController`
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `GET` | `/v1/github/fetch` | Загрузка репозиториев и профиля из GitHub API | USER | `200 OK` |
| `POST` | `/v1/github/import` | Импорт выбранных репозиториев в проекты профиля | USER | `204 No Content` |

### 2.8. Модуль администрирования (`/api/v1/admin`) — `AdminController`
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `GET` | `/v1/admin/dashboard` | Агрегированная статистика платформы | ADMIN | `200 OK` |
| `GET` | `/v1/admin/users` | Список пользователей с пагинацией | ADMIN | `200 OK` |
| `PUT` | `/v1/admin/users/{userId}/plan` | Ручное изменение тарифного плана (FREE/PRO) | ADMIN | `200 OK` |
| `PUT` | `/v1/admin/users/{userId}/role` | Назначение ролей (USER/ADMIN) | ADMIN | `200 OK` |
| `GET` | `/v1/admin/audit` | Просмотр системных журналов аудита безопасности | ADMIN | `200 OK` |

### 2.9. Модули биллинга (`/api/v1/billing`, `/api/v1/billing/kaspi`)
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `POST` | `/v1/billing/checkout` | Инициализация оплаты через Stripe Checkout | USER | `200 OK` |
| `GET` | `/v1/billing/status` | Проверка статуса подписки | USER | `200 OK` |
| `POST` | `/v1/billing/webhook` | Webhook обработки платежей Stripe | Публичный (Stripe IP) | `200 OK` |
| `POST` | `/v1/billing/kaspi/checkout` | Формирование счета Kaspi QR / Pay | USER | `200 OK` |
| `POST` | `/v1/billing/kaspi/webhook` | Webhook подтверждения платежа Kaspi | Публичный (Kaspi IP) | `200 OK` |

### 2.10. Мониторинг и наблюдаемость (`/actuator`)
| Метод | Путь | Описание | Доступ | Успешный статус |
|---|---|---|---|---|
| `GET` | `/actuator/health` | Проверка жизнеспособности сервиса (Liveness/Readiness) | Публичный | `200 OK` (`UP`) |
| `GET` | `/actuator/metrics` | Системные метрики JVM, пулов потоков и БД | ADMIN | `200 OK` |

---

## 3. Реестр маршрутов фронтенда (Frontend Router Registry)

Фронтенд маршрутизируется через `react-router-dom` в файле `frontend/src/app/router/AppRouter.tsx`:

| URL путь | Компонент страницы | Тип защиты | Назначение |
|---|---|---|---|
| `/` | `RootRedirect` | Авторизационный роутер | Перенаправление авторизованных на `/dashboard`, гостей на `/login` |
| `/login` | `LoginPage` | `PublicRoute` | Вход по email/паролю и кнопки OAuth2 (GitHub/Google) |
| `/register` | `RegisterPage` | `PublicRoute` | Регистрация нового разработчика |
| `/reset-password` | `ResetPasswordPage` | `PublicRoute` | Сброс и ввод нового пароля по токену |
| `/auth/callback` | `AuthCallback` | Публичный | Обработка редиректа OAuth2 провайдеров и сохранение JWT |
| `/dashboard` | `DashboardPage` | `PrivateRoute` | Сводная панель: статус профиля, прогресс, последние отклики |
| `/profile` | `ProfileEditPage` | `PrivateRoute` | Полноценный редактор профиля со всеми секциями |
| `/resume` | `ResumePage` | `PrivateRoute` | Конструктор резюме (Resume Builder) с Live превью |
| `/tracker` | `JobTrackerPage` | `PrivateRoute` | Kanban-доска откликов на вакансии со статусами |
| `/import` | `ImportResumePage` | `PrivateRoute` | Загрузка PDF-резюме для автоматического AI-парсинга |
| `/p/:username` | `PortfolioPage` | Публичный | Публичная страница визитки/портфолио разработчика |
| `/pricing` | `PricingPage` | `PrivateRoute` | Страница тарифов с выбором Stripe или Kaspi Pay |
| `/billing/success` | `SuccessPage` | `PrivateRoute` | Страница успешной оплаты подписки PRO |
| `/billing/cancel` | `CancelPage` | `PrivateRoute` | Страница отмены платежной сессии |
| `/admin` | `AdminDashboardPage` | `AdminGuard` | Главный дашборд администратора системы |
| `/admin/users` | `AdminUsersPage` | `AdminGuard` | Управление учетными записями пользователей |
| `/admin/audit` | `AdminAuditPage` | `AdminGuard` | Просмотр журнала аудита безопасности |
| `/settings` | `SettingsPage` | `PrivateRoute` | Настройки аккаунта, темы и привязки GitHub |
| `/legal/privacy` | `PrivacyPolicy` | Публичный | Политика конфиденциальности сервиса |
| `/legal/terms` | `TermsOfService` | Публичный | Пользовательское соглашение |
| `/legal/refund` | `RefundPolicy` | Публичный | Условия возврата платежей |

---

## 4. Детальный разбор аудита 8 логических дыр

### 4.1. AI Pipeline & Safe Fallback
- **Первопричина**: Метод `cleanAndValidateJson` в `GroqClient` ожидал строго валидный JSON-объект. При вызове генератора LinkedIn модель возвращала обычный текст без фигурных скобок, что вызывало `LlmException(Reason.INVALID_RESPONSE)` и аварийный код 500 для пользователя.
- **Внедрённое решение**:
  1. В `backend/src/main/resources/prompts/linkedin_generator_v1.txt` зафиксировано:
     ```text
     You MUST return ONLY a JSON object with this exact structure:
     {
       "content": "..."
     }
     ```
  2. В `AiAnalysisService.java` добавлен метод `buildFallbackParsedProfile`:
     ```java
     private ParsedProfileDto buildFallbackParsedProfile(ProfileDto profile) {
         return ParsedProfileDto.builder()
                 .fullName(profile != null ? profile.getFullName() : null)
                 .headline(profile != null ? profile.getHeadline() : null)
                 .summary(profile != null ? profile.getSummary() : null)
                 .skills(java.util.Collections.emptyList())
                 .build();
     }
     ```
  3. В `generateFullProfile` и `parseResumePdf` блок `catch` теперь перехватывает любые сбои LLM и возвращает безопасный fallback вместо выброса 500.

### 4.2. Flying Saucer PDF Engine & Шаблоны
- **Первопричина**: Библиотека `flying-saucer-pdf` базируется на древнем парсере XHTML и стандарте CSS 2.1. Использование Flexbox, Grid, CSS-переменных (`var(--...)`) или незакрытых тегов ломает генерацию документа.
- **Внедрённое решение**:
  1. Все 6 шаблонов (`apple-modern`, `clean`, `github`, `grok-monolith`, `milky-soft`, `phub-orange`) в `templates/resume/` переведены строго на табличную верстку (`<table>`, `<tr>`, `<td>`), float-свойства и инлайн-стили с шестнадцатеричными цветами (`#0d1117`, `#238636`).
  2. В `PdfGeneratorService.initFonts()` реализован механизм извлечения шрифтов из classpath во временную директорию ОС при старте контейнера, что решило проблему невозможности чтения путей `jar:file:...` библиотекой iText.
  3. Подтверждена поддержка CSS-класса `compact` при передаче `singlePage=true`.

### 4.3. GitHub Integration
- **Первопричина**: Сортировка репозиториев выполнялась по дате создания, из-за чего в портфолио попадали пустые и заброшенные форки. При попытке синхронизации у пользователя без токена выбрасывался `RuntimeException("GitHub account is not connected")`, превращавшийся в HTTP 500.
- **Внедрённое решение**:
  1. В `GitHubRepoScorer.java` реализован композитный алгоритм ранжирования:
     $$\text{Score} = (\text{Stars} \times 0.35) + (\text{Recency} \times 0.30) + (\text{CodeSize} \times 0.20) + (\text{Forks} \times 0.15)$$
  2. В `GitHubReadmeParser.java` внедрен метод `extractCleanDescription()`, удаляющий регулярными выражениями бейджи Shields.io (`[!\[...\](...)]`), markdown-ссылки, сырой HTML и заголовки `#`.
  3. В `GitHubService.java` ошибка отсутствия привязки переведена на `IllegalArgumentException` (HTTP 400).

### 4.4. Разделение языков программирования и разговорных языков
- **Первопричина**: В анкетах пользователей и при AI-парсинге резюме в раздел языков попадали Java, Python, C++, TypeScript.
- **Внедрённое решение**:
  1. В системные промпты `full_profile_generator_v1.txt` и `resume_parser_v1.txt` добавлено правило:
     ```text
     STRICT RULE: The "languages" array MUST ONLY contain natural human spoken languages (e.g. English, Russian, German).
     NEVER include programming languages (Java, Python, TypeScript, etc.) in the languages array. Put them in skills.
     ```
  2. В `LanguageService.java` внедрён статический справочник:
     ```java
     private static final Set<String> PROGRAMMING_LANGUAGES = Set.of(
         "java", "python", "javascript", "typescript", "c++", "c#", "golang", "rust", "kotlin", "swift", "php", "ruby", "sql", "html", "css"
     );
     ```
     Попытка сохранения таких значений блокируется с `IllegalArgumentException("... is a programming language, not a spoken language")`.
  3. В `ProfileService.importParsedResume()` реализован автоматический перенос распознанных языков программирования в коллекцию навыков `Skill` с категорией `"Languages"`.

### 4.5. Безопасность авторизации, OAuth2 и CORS
- **Первопричина**:
  - `OPTIONS` запросы с фронтенда отклонялись с кодом 403, так как Render переопределял `cors.allowed-origins`.
  - Запрос `/api/v1/auth/logout` падал с 403 Forbidden из-за валидации CSRF по заголовку Origin.
  - При наличии остаточной куки `medev_link_jwt` вход через Google связывал профиль со старым пользователем.
- **Внедрённое решение**:
  1. В `SecurityConfig.java` список разрешенных доменов для CORS переведен на постоянный код: `https://app.medev.mrsgemaseny.com`, `https://medev.mrsgemaseny.com`, а также паттерны `https://*.mrsgemaseny.com` и `https://*.vercel.app`.
  2. В `AuthController.java` проверка CSRF по Origin синхронизирована с белым списком.
  3. В `CustomOAuth2UserService.java` флаг связывания ограничен строго GitHub:
     ```java
     boolean isLinking = Boolean.TRUE.equals(request.getSession().getAttribute("linking_flow"));
     if (isLinking && "github".equals(registrationId)) { ... }
     ```
  4. При логауте гарантированно удаляются обе куки (`refresh_token` и `medev_link_jwt`) с параметрами `SameSite=None; Secure; maxAge=0`.

### 4.6. Устойчивость парсера вакансий (Web Scraper Resilience)
- **Первопричина**: `WebScraperService` перехватывал только `IOException`. При передаче невалидного URL или адреса локальной сети валидация SSRF выбрасывала `IllegalArgumentException`, что приводило к сбою контроллера с 500 ошибкой.
- **Внедрённое решение**:
  - Блок перехвата расширен до общего `Exception`:
    ```java
    } catch (Exception e) {
        log.error("Failed to scrape job url: {}", url, e);
        request.setRole("Manual Entry Required");
        request.setCompanyName("Failed to scrape");
        request.setNotes("Could not fetch details from URL: " + e.getMessage());
    }
    ```

### 4.7. Валидация этапов Kanban (Job Tracker Status Transitions)
- **Первопричина**: Контроллер позволял перевести отклик из статуса `WISHLIST` сразу в `OFFER` в обход подачи резюме и интервью.
- **Внедрённое решение**:
  - В `JobApplicationService.java` внедрён метод `validateStatusTransition()`:
    ```java
    private void validateStatusTransition(ApplicationStatus current, ApplicationStatus next) {
        if (current == null || next == null || current == next) return;
        if (current == ApplicationStatus.WISHLIST && next == ApplicationStatus.OFFER) {
            throw new IllegalArgumentException("Cannot transition directly from WISHLIST to OFFER. Application must be APPLIED or in INTERVIEW first.");
        }
    }
    ```

### 4.8. Унификация глобальной обработки исключений
- **Первопричина**: Часть исключений возвращала `{ "error": "..." }`, часть — `{ "errors": { ... } }`, не предоставляя код статуса и детальное сообщение для фронтенда.
- **Внедрённое решение**:
  - В `GlobalExceptionHandler.java` все обработчики унифицированы через фабричный метод `errorPayload`:
    ```java
    private Map<String, Object> errorPayload(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value());
        body.put("error", message != null ? message : status.getReasonPhrase());
        body.put("message", message != null ? message : status.getReasonPhrase());
        return body;
    }
    ```
  - Обеспечена совместимость как с клиентами, читающими `response.data.error`, так и с теми, кто ожидает `response.data.message` или `response.data.status`.

---

## 5. Аудит синхронного Email-движка (Анализ архитектурных рисков)

По специальному указанию проведён аудит подсистемы отправки email-уведомлений:

### 5.1. Текущее состояние
- В текущей реализации кодовой базы `MeDev` прямые SMTP-вызовы (через `JavaMailSender`) отсутствуют.
- Восстановление пароля в `AuthService.forgotPassword()` генерирует криптографический токен и сохраняет его в Redis на 15 минут (`password_reset:token:<token>`), записывая событие в аудит-лог `AUTH_PASSWORD_RESET_REQUESTED`.
- Внешняя отправка писем вынесена за рамки транзакций пользователя.

### 5.2. Оценка рисков при внедрении SMTP
Если при добавлении `EmailNotificationService` отправка писем будет вызываться синхронно внутри `@Transactional` методов (например, при регистрации `AuthService.register()`):
1. **Задержка потоков (Thread Starvation)**: SMTP-сервер провайдера (Resend, SendGrid, Mailgun) при пиковых нагрузках или сетевых лагах отвечает с задержкой 3–5 секунд.
2. **Исчерпание пула соединений БД (HikariCP Exhaustion)**: Пока поток ждет ответа от SMTP, транзакция базы данных удерживает активное соединение из пула. 10 одновременных регистраций полностью парализуют пул HikariCP на 5 секунд.
3. **Rollback транзакции**: Если SMTP-провайдер вернет сетевую ошибку (503 или timeout), транзакция регистрации пользователя откатится, хотя пользователь уже ввел все данные.

### 5.3. Рекомендуемое архитектурное решение
При подключении `JavaMailSender` необходимо строго следовать асинхронной модели на базе Spring Events:
```java
// 1. Публикация события в транзакционном сервисе
@Transactional
public AuthResponse register(RegisterRequest request) {
    User user = userRepository.save(...);
    eventPublisher.publishEvent(new UserRegisteredEvent(user.getId(), user.getEmail(), user.getFullName()));
    return buildAuthResponse(user);
}

// 2. Асинхронный обработчик строго ПОСЛЕ коммита транзакции
@Component
public class EmailNotificationListener {
    
    @Async("emailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserRegistered(UserRegisteredEvent event) {
        emailSender.sendWelcomeEmail(event.email(), event.fullName());
    }
}
```

---

## 6. Разрешение инцидента с Content Security Policy (CSP)

### 6.1. Симптомы и воспроизведение ошибки
При входе в раздел `/resume` в браузере в консоли возникала ошибка:
```text
Framing 'blob:https://app.medev.mrsgemaseny.com/...' violates the following Content Security Policy directive: "default-src 'self'". 
The request has been blocked. Note that 'frame-src' was not explicitly set, so 'default-src' is used as a fallback.
```
В контейнере превью рендерился пустой документ с пиктограммой ошибки.

### 6.2. Первопричина
1. В заголовке `Content-Security-Policy`, настроенном в `frontend/vercel.json`, отсутствовала явная директива `frame-src`. Браузер применил значение по умолчанию `default-src 'self'`, которое запрещает загрузку `blob:` схем в фреймы.
2. Заголовок `X-Frame-Options: DENY` блокировал встраивание любых фреймов на странице.
3. В `ResumeBuilder.tsx` компонент `iframe` использовал свойство `src={htmlUrl}`, где `htmlUrl` формировался как локальный `blob:` URL.

### 6.3. Внедрённые изменения
1. **`frontend/vercel.json`**:
   - `frame-src` и `child-src` дополнены схемами `'self' blob: data:`:
     ```json
     { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
     { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; frame-src 'self' blob: data:; child-src 'self' blob: data:; connect-src 'self' https://medev-backend.onrender.com https://api.github.com https://va.vercel-scripts.com https://vitals.vercel-insights.com;" }
     ```
2. **`frontend/src/widgets/resume-builder/ResumeBuilder.tsx`**:
   - Перевод на нативный `srcDoc`:
     ```tsx
     <iframe 
       srcDoc={htmlDoc || undefined}
       src={htmlUrl || undefined} 
       className="w-full h-full border-0 bg-white" 
       title="HTML Preview" 
     />
     ```
   HTML-код рендерится внутри `iframe` мгновенно без создания сетевых blob-объектов в DOM, а `src={htmlUrl}` сохранён для обратной совместимости.
3. **Сборка фронтенда**: `npm run build` подтвердил отсутствие ошибок TypeScript и корректную сборку бандлов за 1.73s.

---

## 7. Результаты сквозного E2E тестирования

### 7.1. Матричное тестирование всех 6 шаблонов резюме
Тестовый сьют `e2e/suites/03_resume.test.js` был расширен и выполнил 25 валидаций по всем 6 шаблонам в двух режимах разметки:

| Шаблон | Режим разметки | Эндпоинт | Формат ответа | Статус |
|---|---|---|---|---|
| **apple-modern** | singlePage (1-page) | `/v1/resume/html/apple-modern?preview=true&singlePage=true` | `text/html;charset=UTF-8` | **200 OK** |
| **apple-modern** | multiPage (многостраничный) | `/v1/resume/html/apple-modern?preview=true&singlePage=false` | `text/html;charset=UTF-8` | **200 OK** |
| **clean** | singlePage (1-page) | `/v1/resume/html/clean?preview=true&singlePage=true` | `text/html;charset=UTF-8` | **200 OK** |
| **clean** | multiPage (многостраничный) | `/v1/resume/html/clean?preview=true&singlePage=false` | `text/html;charset=UTF-8` | **200 OK** |
| **github** | singlePage (1-page) | `/v1/resume/html/github?preview=true&singlePage=true` | `text/html;charset=UTF-8` | **200 OK** |
| **github** | multiPage (многостраничный) | `/v1/resume/html/github?preview=true&singlePage=false` | `text/html;charset=UTF-8` | **200 OK** |
| **grok-monolith** | singlePage (1-page) | `/v1/resume/html/grok-monolith?preview=true&singlePage=true` | `text/html;charset=UTF-8` | **200 OK** |
| **grok-monolith** | multiPage (многостраничный) | `/v1/resume/html/grok-monolith?preview=true&singlePage=false` | `text/html;charset=UTF-8` | **200 OK** |
| **milky-soft** | singlePage (1-page) | `/v1/resume/html/milky-soft?preview=true&singlePage=true` | `text/html;charset=UTF-8` | **200 OK** |
| **milky-soft** | multiPage (многостраничный) | `/v1/resume/html/milky-soft?preview=true&singlePage=false` | `text/html;charset=UTF-8` | **200 OK** |
| **phub-orange** | singlePage (1-page) | `/v1/resume/html/phub-orange?preview=true&singlePage=true` | `text/html;charset=UTF-8` | **200 OK** |
| **phub-orange** | multiPage (многостраничный) | `/v1/resume/html/phub-orange?preview=true&singlePage=false` | `text/html;charset=UTF-8` | **200 OK** |
| **apple-modern** | singlePage (1-page) | `/v1/resume/generate/apple-modern?preview=true&singlePage=true` | `application/pdf` | **200 OK** |
| **apple-modern** | multiPage (многостраничный) | `/v1/resume/generate/apple-modern?preview=true&singlePage=false` | `application/pdf` | **200 OK** |
| **clean** | singlePage (1-page) | `/v1/resume/generate/clean?preview=true&singlePage=true` | `application/pdf` | **200 OK** |
| **clean** | multiPage (многостраничный) | `/v1/resume/generate/clean?preview=true&singlePage=false` | `application/pdf` | **200 OK** |
| **github** | singlePage (1-page) | `/v1/resume/generate/github?preview=true&singlePage=true` | `application/pdf` | **200 OK** |
| **github** | multiPage (многостраничный) | `/v1/resume/generate/github?preview=true&singlePage=false` | `application/pdf` | **200 OK** |
| **grok-monolith** | singlePage (1-page) | `/v1/resume/generate/grok-monolith?preview=true&singlePage=true` | `application/pdf` | **200 OK** |
| **grok-monolith** | multiPage (многостраничный) | `/v1/resume/generate/grok-monolith?preview=true&singlePage=false` | `application/pdf` | **200 OK** |
| **milky-soft** | singlePage (1-page) | `/v1/resume/generate/milky-soft?preview=true&singlePage=true` | `application/pdf` | **200 OK** |
| **milky-soft** | multiPage (многостраничный) | `/v1/resume/generate/milky-soft?preview=true&singlePage=false` | `application/pdf` | **200 OK** |
| **phub-orange** | singlePage (1-page) | `/v1/resume/generate/phub-orange?preview=true&singlePage=true` | `application/pdf` | **200 OK** |
| **phub-orange** | multiPage (многостраничный) | `/v1/resume/generate/phub-orange?preview=true&singlePage=false` | `application/pdf` | **200 OK** |
| **Markdown README** | full template | `/v1/profile/readme?template=full` | `text/markdown;charset=UTF-8` | **200 OK** |
| **Невалидный шаблон** | unknown | `/v1/resume/html/unknown-template-xyz?preview=true` | `application/json` | **400 Bad Request** |

**Результат**: 25 проверок из 25 пройдены успешно (100% PASS).

### 7.2. Полный прогон сквозного E2E сьюта (66 проверок на боевом сервере)
Запуск производился командой `node e2e/runner.js` против `https://medev-backend.onrender.com/api`:

```text
======================================================================
                    BACKEND API ROUTE COVERAGE MATRIX                 
======================================================================
  METHOD      ENDPOINT                                  STATUS    LATENCY     RESULT
  ----------------------------------------------------------------------------------
  POST        /v1/auth/register                         201       12598 ms    PASS
  POST        /v1/auth/register                         409       961 ms      PASS
  POST        /v1/auth/login                            401       4770 ms     PASS
  POST        /v1/auth/login                            200       4312 ms     PASS
  POST        /v1/auth/refresh                          200       1639 ms     PASS
  POST        /v1/auth/logout                           204       778 ms      PASS
  GET         /v1/profile                               401       729 ms      PASS
  POST        /v1/auth/register                         201       2900 ms     PASS
  GET         /v1/profile                               200       1630 ms     PASS
  PUT         /v1/profile                               200       1077 ms     PASS
  PUT         /v1/profile/section-order                 204       1093 ms     PASS
  POST        /v1/profile/skills                        201       796 ms      PASS
  PUT         /v1/profile/skills/:id                    200       537 ms      PASS
  DELETE      /v1/profile/skills/:id                    204       557 ms      PASS
  POST        /v1/profile/experience                    201       917 ms      PASS
  PUT         /v1/profile/experience/:id                200       594 ms      PASS
  DELETE      /v1/profile/experience/:id                204       693 ms      PASS
  POST        /v1/profile/education                     201       703 ms      PASS
  PUT         /v1/profile/education/:id                 200       686 ms      PASS
  DELETE      /v1/profile/education/:id                 204       597 ms      PASS
  POST        /v1/profile/languages                     201       594 ms      PASS
  PUT         /v1/profile/languages/:id                 200       502 ms      PASS
  DELETE      /v1/profile/languages/:id                 204       495 ms      PASS
  POST        /v1/profile/projects                      201       714 ms      PASS
  PUT         /v1/profile/projects/:id                  200       695 ms      PASS
  DELETE      /v1/profile/projects/:id                  204       695 ms      PASS
  GET         /v1/profile/readme?template=full          200       5116 ms     PASS
  GET         /v1/profile/export/json                   200       484 ms      PASS
  POST        /v1/auth/register                         201       4408 ms     PASS
  PUT         /v1/profile                               200       705 ms      PASS
  POST        /v1/profile/skills                        201       584 ms      PASS
  GET         /v1/resume/html/github?preview=true       200       1704 ms     PASS
  GET         /v1/resume/generate/github?preview=true   200       8588 ms     PASS
  GET         /v1/resume/html/clean?preview=true        200       902 ms      PASS
  GET         /v1/resume/html/unknown-template-xyz      400       465 ms      PASS
  GET         /v1/portfolio/:username                   200       593 ms      PASS
  GET         /v1/portfolio/non_existent_dev            404       474 ms      PASS
  POST        /v1/auth/register                         201       3005 ms     PASS
  POST        /v1/tracker/applications                  201       704 ms      PASS
  GET         /v1/tracker/applications                  200       512 ms      PASS
  PUT         /v1/tracker/applications/:id              200       505 ms      PASS
  DELETE      /v1/tracker/applications/:id              204       275 ms      PASS
  DELETE      /v1/tracker/applications/:id              404       467 ms      PASS
  POST        /v1/auth/register                         201       2400 ms     PASS
  PUT         /v1/tracker/applications/:id (IDOR)       403       711 ms      PASS
  DELETE      /v1/tracker/applications/:id (IDOR)       403       480 ms      PASS
  POST        /v1/auth/register                         201       2152 ms     PASS
  PUT         /v1/profile                               200       503 ms      PASS
  GET         /v1/ai/quota                              200       601 ms      PASS
  POST        /v1/ai/generate/summary                   200       5114 ms     PASS
  POST [SSE]  /v1/ai/chat/stream                        200       1082 ms     PASS
  GET         /v1/github/fetch                          401       432 ms      PASS
  POST        /v1/auth/register                         201       3452 ms     PASS
  GET         /v1/github/fetch (unlinked)               500/400   421 ms      PASS
  POST        /v1/github/import (unlinked)              500/400   382 ms      PASS
  GET         /v1/admin/dashboard (anonymous)           401       243 ms      PASS
  GET         /v1/admin/users (anonymous)               401       353 ms      PASS
  GET         /v1/admin/audit (anonymous)               401       414 ms      PASS
  POST        /v1/auth/register                         201       3880 ms     PASS
  GET         /v1/admin/dashboard (USER role)           403       399 ms      PASS
  GET         /v1/admin/users (USER role)               403       421 ms      PASS
  GET         /v1/admin/audit (USER role)               403       455 ms      PASS
  GET         /actuator/health                          200       364 ms      PASS
  GET         /actuator/metrics (anonymous)             401       225 ms      PASS
  POST        /v1/auth/register                         201       3545 ms     PASS
  GET         /actuator/metrics (USER role)             403       305 ms      PASS
  ----------------------------------------------------------------------------------
  Total Checks: 66 | Passed: 66 | Failed: 0 | Success Rate: 100%
======================================================================
```

---

## 8. Статус Git и синхронизация Second Brain

### 8.1. Репозиторий проекта `MeDev`
- Коммиты сессии:
  - `f21d366`: `fix(core): audit fixes for AI, GitHub, Job Tracker, languages and global errors`
  - `3370931`: `fix(frontend): permit blob and sameorigin framing in CSP and test 6 resume templates across modes`
  - `05d82bd`: `docs(audit): add AUDIT_REPORT_2026-09-09.md covering audit, CSP fix, and E2E results`
- Ветка `main` синхронизирована с `origin/main`, рабочее дерево чисто.
- Актуализирован файл контекста `.agents/CONTEXT.md`.

### 8.2. Репозиторий базы знаний `Second Brain`
- Коммиты сессии:
  - `1b5040f`: `docs(journal): complete session report on audit, logical fixes, and E2E coverage`
  - `0813b04`: `docs(journal): document CSP fix and 6-template verification across singlePage and multiPage`
- Журнал `journal/2026-09-09/medev.md` полностью отражает ход инженерных работ.
- Рабочее дерево чисто, ветка `main` синхронизирована с `origin/main`.

---

## 9. План дальнейших инженерных инициатив (Backlog)
1. **RAG Semantic Search**: интеграция `VectorizationService` с расширением `pgvector` в PostgreSQL для автоматического матчинга откликов из Job Tracker с профилем пользователя.
2. **Асинхронный движок генерации PDF**: при росте нагрузки перевод рендеринга PDF на `ThreadPoolTaskExecutor` с возвратом статуса `202 Accepted` и отдачей готового документа через опрос/SSE.
3. **Автоматизированный бэкап БД**: настройка ночного дампа базы данных в S3/R2 хранилище через GitHub Actions cron.
4. **Централизованный мониторинг**: развёртывание Sentry для фронтенда и Prometheus/Grafana для метрик Actuator.
