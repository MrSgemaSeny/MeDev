# Current Project Context

## Status
- **Project Stage**: Level 4 — Production Live (Production Deployed: Render backend + Vercel frontend, 262 backend + 38 frontend tests)
- **Developer Level**: Senior / Tech Lead
- **Live Infrastructure**:
  - **Frontend**: Custom Domain (`https://medev.mrsgemaseny.com`) + Vercel (`https://me-dev-two.vercel.app`) + GitHub Pages (`https://mrsgemaseny.github.io/MeDev/`), `@vercel/analytics`, `vercel.json` SPA rewrites.
  - **Backend API**: Render Web Service (`https://medev-backend.onrender.com/api`), Docker, Java 17, Spring Boot 3.3.0.
  - **Database**: Render PostgreSQL 17 (`medev-postgres`, Flyway V24).
  - **Cache & Redis**: Render Redis (`medev-redis`, Valkey 8.1.4) + In-Memory Caffeine L1 (`profiles`, `public-profiles`).
  - **AI Model**: `openai/gpt-oss-20b` (GPT-20B) via Groq API. СТРОГО: Модели Llama НЕ РАБОТАЮТ и запрещены. Работает ТОЛЬКО `openai/gpt-oss-20b`.
- **Monorepo Structure**:
  - `backend/`: Spring Boot 3.3.0 (Java 17, PostgreSQL 17, Redis, Groq AI).
  - `frontend/`: Vite + React 19 SPA (`app.medev.mrsgemaseny.com`, Dashboard, Resume Builder, ATS).
  - `landing/`: Next.js 15 App Router SSG (`medev.mrsgemaseny.com`, Marketing, SEO, OpenGraph).
- **Latest Work (2026-09-07 Full Multi-Module Audit & Hardening — 100% COMPLETE)**:
  - **Audit**: Сквозной аудит всех модулей (`auth`, `profile`, `github`, `ai`, `resume`, `billing`, `tracker`) через мульти-агентный оркестратор `scripts/orchestrate.js` (Architect + Reviewer).
  - **P0 Fixes**: `WebScraperService` (2MB maxBodySize, 4s таймаут, Jsoup санитизация против Stored XSS, блокировка метадата IP `169.254.169.254` против SSRF); `PdfGeneratorService` (XXE hardening DocumentBuilderFactory, безопасный рендеринг спецсимволов).
  - **P1 Fixes**: `JwtFilter` (немедленный 401 на отозванные токены в Redis); `AuthController` (усиленная валидация CSRF по Origin/Referer); `AuthService` (15-сек Redis Grace Period при ротации refresh токенов); `KaspiPayService` (разрешено продление активного PRO тарифа); `StripeService` (синхронизация `subscriptionExpiresAt` с планировщиком).
  - **P2/P3 Fixes**: `ProfileService` (валидация списка секций в `updateSectionOrder` по белому списку и дубликатам); `@Valid` валидация во всех reorder-эндпоинтах `ProfileController`; `@Transactional` в `TokenAccountingService`.
  - **Test Baseline**: 262/262 backend tests green (100%), 38/38 frontend tests green (100%).
- **Latest Hotfix (2026-09-09 CORS & CookieBanner Fix)**:
  - **CORS**: `https://app.medev.mrsgemaseny.com` добавлен в `cors.allowed-origins` (`application-prod.yml` и `application.yml`). В `SecurityConfig.java` разделена обработка exact origins и pattern origins (`setAllowedOriginPatterns`).
  - **Frontend Crash**: Устранена ошибка `TypeError: Cannot destructure property 'basename' of 'M.useContext(...)' as it is null` в `CookieBanner.tsx` путем замены `Link` (из `react-router-dom`) на нативный тег `<a>`, так как баннер рендерится в `App.tsx` вне дерева `RouterProvider`.
- **Latest Milestone (2026-09-09 Full Logical Gaps Audit & Production E2E Suite — 100% COMPLETE)**:
  - **E2E Suite**: Создан сквозной автоматизированный E2E API тестовый сьют в `e2e/` (9 модулей, 66 проверок) с поддержкой Cookie Jar, SSE-стримов, замера latency и retry при 502/503/504.
  - **Verification**: 100% PASS на боевом контуре Render (`https://medev-backend.onrender.com/api`).
  - **Logical Gaps Fixes**:
    1. **AI Pipeline**: Внедрен безопасный fallback `buildFallbackParsedProfile` в `AiAnalysisService` при отказах LLM. В `linkedin_generator_v1.txt` зафиксирован JSON-формат для `GroqClient.structuredCompletion`.
    2. **Language Parser**: Строгое разделение разговорных языков и языков программирования в промптах, валидация в `LanguageService` (400) и авто-редирект языков программирования в навыки (`Skill`) в `ProfileService`.
    3. **GitHub Integration**: Скорректирован скоринг (`GitHubRepoScorer` 35/30/20/15), очистка markdown-шума и бейджей в `GitHubReadmeParser`, возврат 400 Bad Request при отсутствии токена в `GitHubService`.
    4. **Auth & OAuth2**: Защита от перехвата аккаунта через Google OAuth (привязка ограничена строго GitHub), надежная очистка кук `refresh_token` и `medev_link_jwt` при логауте, доверенные CORS origins в `SecurityConfig` и `AuthController`.
    5. **Job Tracker**: Валидация перехода статусов в `JobApplicationService` (запрет прямых переходов WISHLIST -> OFFER), отказоустойчивый `WebScraperService` с общим перехватом `Exception`.
    6. **Global Error Handling**: Унифицирован ответ ошибок `{ status, error, message }` в `GlobalExceptionHandler.java`.
  - **Runner**: Запуск через `npm run test:e2e` с выводом матрицы покрытия.

- **Latest Hotfixes (2026-09-09)**:
  - **Auth & OAuth**: Устранена гонка авторизации в `App.tsx` vs `AuthCallback.tsx`. Исключен фантомный сетевой вызов `/auth/logout` при открытии сайта анонимными пользователями. Добавлена нормализация email в нижний регистр в `CustomOAuth2UserService`.
  - **AI Chat Stream**: Устранена склейка слов и чисел ("в90дней", "на40%") за счет передачи структурированного JSON `{ "content": chunk }` в `AiController.java` и исключения `.trim()` / `substring(1)` на фронтенде. В `assistant_system_v1.txt` внедрен запрет галлюцинирования метрик и обязательные уточняющие вопросы по целям пользователя. Добавлена функция `cleanContent` в `AiChatWidget.tsx` и `useAiGenerate.ts` для бесшовного авто-декодирования склеенных JSON-токенов в UI.
  - **Resume PRO Gating**: Исправлен 403 Forbidden на шаблонах `apple-modern`, `milky-soft`, `phub-orange`. В `ResumeController.java` добавлен пропуск для пользователей с ролью `Role.ADMIN`. На фронтенде добавлен визуальный бейдж PRO и перехват 403 с автоматическим вызовом модалки апгрейда `openUpsell()`. Автоматический апгрейд аккаунта владельца (`mrsgemaseny`) до `ADMIN` и `PRO`.
  - **Landing Page Sync**: Синхронизированы шаблоны в `TemplatesShowcase.tsx` (`Clean ATS`, `GitHub`, `Milky Soft`, `Apple`, `Grok`, `PH Orange`) с бейджами FREE/PRO. Позиционирование фичи #2 уточнено до «AI Job Match & Cover Letter» без ложных обещаний. Базовая цена зафиксирована на уровне `$9 / месяц или 4 500 ₸`.
  - **AI Parser Hardening**: Устранены 500/400 ошибки в `/api/v1/ai/parse-resume`. Добавлен обработчик `LlmException` в `GlobalExceptionHandler.java` (429/503/502). Типизированные ошибки в `AiAnalysisService.java` и детальная валидация PDF на русском языке в `AiController.java`. Покрытие `GlobalExceptionHandlerTest`.
  - **Comprehensive Technical & Architecture Audit**: Сформирован исчерпывающий эталонный документ `TECHNICAL_AUDIT.md` (соответствует Senior Architect стандартам, охватывает топологию C4, реестр 42 API эндпоинтов, 12 сущностей, 24 Flyway миграции, 6 шаблонов резюме, PII Masking, Smart Merge, Resilient SSE и дорожную карту развития).
- **Mobile Capacitor & Android/iOS CI/CD (2026-09-09 — 100% COMPLETE)**:
  - **Capacitor Integration**: Установлен Capacitor 8 (`@capacitor/core`, `@capacitor/app`, `@capacitor/filesystem`, `@capacitor/share`, `@capacitor/status-bar`, `@capacitor/android`, `@capacitor/ios`, `@capacitor/cli`). Создан `capacitor.config.ts` (appId: `com.medev.app`).
  - **Backend CORS**: Добавлены мобильные origins (`capacitor://localhost`, `http://localhost`, `https://localhost`) в `SecurityConfig.java`.
  - **Mobile UX/UI**: Safe-area CSS переменные (`--sat`, `--sab`), `overscroll-behavior-y: none`, запрет селекта `.no-select`, viewport-fit=cover в `index.html`.
  - **Native Features**: Хук кнопки назад Android `useAndroidBackButton.ts` в `App.tsx`, нативный экспорт PDF через `exportResumePdf.ts` (Cache Filesystem + Share Sheet) в `ResumeBuilder.tsx`.
  - **Android Project**: Инициализирован проект `frontend/android/`, настроены разрешения INTERNET, ACCESS_NETWORK_STATE и `windowSoftInputMode="adjustResize"`.
  - **Cloud CI/CD Workflows**:
    - `.github/workflows/build-mobile-android.yml`: Сборка debug APK и подпись release AAB для Google Play.
    - `.github/workflows/build-mobile-ios.yml`: Сборка xcarchive для iOS на macos-14.
  - **Scripts**: `build:web`, `cap:sync`, `build:mobile`. Тесты: 262 backend PASS, 41 frontend PASS.

- **Mobile Web Adaptation (2026-09-09 — 100% COMPLETE)**:
  - **Landing (Next.js 15 App Router)**: Включен `viewportFit: 'cover'`, `--sat`/`--sab`, `overflow-x: hidden`, мобильное меню-drawer с гамбургером, затемнением и блокировкой скролла body, устранен перелив 322px в `Cta.tsx`, адаптивная шапка `Hero.tsx`, touch targets >= 44px. Сборка 9/9 статических страниц PASS.
# Current Project Context

## Status
- **Project Stage**: Level 4 — Production Live (Production Deployed: Render backend + Vercel frontend, 262 backend + 38 frontend tests)
- **Developer Level**: Senior / Tech Lead
- **Live Infrastructure**:
  - **Frontend**: Custom Domain (`https://medev.mrsgemaseny.com`) + Vercel (`https://me-dev-two.vercel.app`) + GitHub Pages (`https://mrsgemaseny.github.io/MeDev/`), `@vercel/analytics`, `vercel.json` SPA rewrites.
  - **Backend API**: Render Web Service (`https://medev-backend.onrender.com/api`), Docker, Java 17, Spring Boot 3.3.0.
  - **Database**: Render PostgreSQL 17 (`medev-postgres`, Flyway V24).
  - **Cache & Redis**: Render Redis (`medev-redis`, Valkey 8.1.4) + In-Memory Caffeine L1 (`profiles`, `public-profiles`).
  - **AI Model**: `openai/gpt-oss-20b` (GPT-20B) via Groq API. СТРОГО: Модели Llama НЕ РАБОТАЮТ и запрещены. Работает ТОЛЬКО `openai/gpt-oss-20b`.
- **Monorepo Structure**:
  - `backend/`: Spring Boot 3.3.0 (Java 17, PostgreSQL 17, Redis, Groq AI).
  - `frontend/`: Vite + React 19 SPA (`app.medev.mrsgemaseny.com`, Dashboard, Resume Builder, ATS).
  - `landing/`: Next.js 15 App Router SSG (`medev.mrsgemaseny.com`, Marketing, SEO, OpenGraph).
- **Latest Work (2026-09-07 Full Multi-Module Audit & Hardening — 100% COMPLETE)**:
  - **Audit**: Сквозной аудит всех модулей (`auth`, `profile`, `github`, `ai`, `resume`, `billing`, `tracker`) через мульти-агентный оркестратор `scripts/orchestrate.js` (Architect + Reviewer).
  - **P0 Fixes**: `WebScraperService` (2MB maxBodySize, 4s таймаут, Jsoup санитизация против Stored XSS, блокировка метадата IP `169.254.169.254` против SSRF); `PdfGeneratorService` (XXE hardening DocumentBuilderFactory, безопасный рендеринг спецсимволов).
  - **P1 Fixes**: `JwtFilter` (немедленный 401 на отозванные токены в Redis); `AuthController` (усиленная валидация CSRF по Origin/Referer); `AuthService` (15-сек Redis Grace Period при ротации refresh токенов); `KaspiPayService` (разрешено продление активного PRO тарифа); `StripeService` (синхронизация `subscriptionExpiresAt` с планировщиком).
  - **P2/P3 Fixes**: `ProfileService` (валидация списка секций в `updateSectionOrder` по белому списку и дубликатам); `@Valid` валидация во всех reorder-эндпоинтах `ProfileController`; `@Transactional` в `TokenAccountingService`.
  - **Test Baseline**: 262/262 backend tests green (100%), 38/38 frontend tests green (100%).
- **Latest Hotfix (2026-09-09 CORS & CookieBanner Fix)**:
  - **CORS**: `https://app.medev.mrsgemaseny.com` добавлен в `cors.allowed-origins` (`application-prod.yml` и `application.yml`). В `SecurityConfig.java` разделена обработка exact origins и pattern origins (`setAllowedOriginPatterns`).
  - **Frontend Crash**: Устранена ошибка `TypeError: Cannot destructure property 'basename' of 'M.useContext(...)' as it is null` в `CookieBanner.tsx` путем замены `Link` (из `react-router-dom`) на нативный тег `<a>`, так как баннер рендерится в `App.tsx` вне дерева `RouterProvider`.
- **Latest Milestone (2026-09-09 Full Logical Gaps Audit & Production E2E Suite — 100% COMPLETE)**:
  - **E2E Suite**: Создан сквозной автоматизированный E2E API тестовый сьют в `e2e/` (9 модулей, 66 проверок) с поддержкой Cookie Jar, SSE-стримов, замера latency и retry при 502/503/504.
  - **Verification**: 100% PASS на боевом контуре Render (`https://medev-backend.onrender.com/api`).
  - **Logical Gaps Fixes**:
    1. **AI Pipeline**: Внедрен безопасный fallback `buildFallbackParsedProfile` в `AiAnalysisService` при отказах LLM. В `linkedin_generator_v1.txt` зафиксирован JSON-формат для `GroqClient.structuredCompletion`.
    2. **Language Parser**: Строгое разделение разговорных языков и языков программирования в промптах, валидация в `LanguageService` (400) и авто-редирект языков программирования в навыки (`Skill`) в `ProfileService`.
    3. **GitHub Integration**: Скорректирован скоринг (`GitHubRepoScorer` 35/30/20/15), очистка markdown-шума и бейджей в `GitHubReadmeParser`, возврат 400 Bad Request при отсутствии токена в `GitHubService`.
    4. **Auth & OAuth2**: Защита от перехвата аккаунта через Google OAuth (привязка ограничена строго GitHub), надежная очистка кук `refresh_token` и `medev_link_jwt` при логауте, доверенные CORS origins в `SecurityConfig` и `AuthController`.
    5. **Job Tracker**: Валидация перехода статусов в `JobApplicationService` (запрет прямых переходов WISHLIST -> OFFER), отказоустойчивый `WebScraperService` с общим перехватом `Exception`.
    6. **Global Error Handling**: Унифицирован ответ ошибок `{ status, error, message }` в `GlobalExceptionHandler.java`.
  - **Runner**: Запуск через `npm run test:e2e` с выводом матрицы покрытия.

- **Latest Hotfixes (2026-09-09)**:
  - **Auth & OAuth**: Устранена гонка авторизации в `App.tsx` vs `AuthCallback.tsx`. Исключен фантомный сетевой вызов `/auth/logout` при открытии сайта анонимными пользователями. Добавлена нормализация email в нижний регистр в `CustomOAuth2UserService`.
  - **AI Chat Stream**: Устранена склейка слов и чисел ("в90дней", "на40%") за счет передачи структурированного JSON `{ "content": chunk }` в `AiController.java` и исключения `.trim()` / `substring(1)` на фронтенде. В `assistant_system_v1.txt` внедрен запрет галлюцинирования метрик и обязательные уточняющие вопросы по целям пользователя. Добавлена функция `cleanContent` в `AiChatWidget.tsx` и `useAiGenerate.ts` для бесшовного авто-декодирования склеенных JSON-токенов в UI.
  - **Resume PRO Gating**: Исправлен 403 Forbidden на шаблонах `apple-modern`, `milky-soft`, `phub-orange`. В `ResumeController.java` добавлен пропуск для пользователей с ролью `Role.ADMIN`. На фронтенде добавлен визуальный бейдж PRO и перехват 403 с автоматическим вызовом модалки апгрейда `openUpsell()`. Автоматический апгрейд аккаунта владельца (`mrsgemaseny`) до `ADMIN` и `PRO`.
  - **Landing Page Sync**: Синхронизированы шаблоны в `TemplatesShowcase.tsx` (`Clean ATS`, `GitHub`, `Milky Soft`, `Apple`, `Grok`, `PH Orange`) с бейджами FREE/PRO. Позиционирование фичи #2 уточнено до «AI Job Match & Cover Letter» без ложных обещаний. Базовая цена зафиксирована на уровне `$9 / месяц или 4 500 ₸`.
  - **AI Parser Hardening**: Устранены 500/400 ошибки в `/api/v1/ai/parse-resume`. Добавлен обработчик `LlmException` в `GlobalExceptionHandler.java` (429/503/502). Типизированные ошибки в `AiAnalysisService.java` и детальная валидация PDF на русском языке в `AiController.java`. Покрытие `GlobalExceptionHandlerTest`.
  - **Comprehensive Technical & Architecture Audit**: Сформирован исчерпывающий эталонный документ `TECHNICAL_AUDIT.md` (соответствует Senior Architect стандартам, охватывает топологию C4, реестр 42 API эндпоинтов, 12 сущностей, 24 Flyway миграции, 6 шаблонов резюме, PII Masking, Smart Merge, Resilient SSE и дорожную карту развития).
- **Mobile Capacitor & Android/iOS CI/CD (2026-09-09 — 100% COMPLETE)**:
  - **Capacitor Integration**: Установлен Capacitor 8 (`@capacitor/core`, `@capacitor/app`, `@capacitor/filesystem`, `@capacitor/share`, `@capacitor/status-bar`, `@capacitor/android`, `@capacitor/ios`, `@capacitor/cli`). Создан `capacitor.config.ts` (appId: `com.medev.app`).
  - **Backend CORS**: Добавлены мобильные origins (`capacitor://localhost`, `http://localhost`, `https://localhost`) в `SecurityConfig.java`.
  - **Mobile UX/UI**: Safe-area CSS переменные (`--sat`, `--sab`), `overscroll-behavior-y: none`, запрет селекта `.no-select`, viewport-fit=cover в `index.html`.
  - **Native Features**: Хук кнопки назад Android `useAndroidBackButton.ts` в `App.tsx`, нативный экспорт PDF через `exportResumePdf.ts` (Cache Filesystem + Share Sheet) в `ResumeBuilder.tsx`.
  - **Android Project**: Инициализирован проект `frontend/android/`, настроены разрешения INTERNET, ACCESS_NETWORK_STATE и `windowSoftInputMode="adjustResize"`.
  - **Cloud CI/CD Workflows**:
    - `.github/workflows/build-mobile-android.yml`: Сборка debug APK и подпись release AAB для Google Play.
    - `.github/workflows/build-mobile-ios.yml`: Сборка xcarchive для iOS на macos-14.
  - **Scripts**: `build:web`, `cap:sync`, `build:mobile`. Тесты: 262 backend PASS, 41 frontend PASS.

- **Mobile Web Adaptation (2026-09-09 — 100% COMPLETE)**:
  - **Landing (Next.js 15 App Router)**: Включен `viewportFit: 'cover'`, `--sat`/`--sab`, `overflow-x: hidden`, мобильное меню-drawer с гамбургером, затемнением и блокировкой скролла body, устранен перелив 322px в `Cta.tsx`, адаптивная шапка `Hero.tsx`, touch targets >= 44px. Сборка 9/9 статических страниц PASS.
  - **Frontend Core & Navigation**: Сайдбар скрыт на экранах <768px (`hidden md:flex`), гамбургер в `AppHeader.tsx`, выезжающий `MobileNavDrawer.tsx` (Zustand `mobileNavStore`), адаптивный `AppLayout.tsx` (`100dvh`, `p-3 sm:p-4 md:p-6 lg:p-8`), защита от авто-зума на iOS Safari (`Input.tsx` и `Form.tsx` font-size 16px), кнопки `Button.tsx` touch target >= 44px.
  - **Quality Gates**: Vitest 41/41 PASS, Vite build 0 ошибок, Next.js build 0 ошибок, Reviewers APPROVE, Forensic Auditor CLEAN (0 emojis, 0 читов).
- **Mobile UI Compaction & ResumeBuilder Mobile UX (2026-09-10 — 100% COMPLETE)**:
  - **Landing Compaction**: Устранен эффект "громоздких блоков" на мобильных экранах (320px–600px). Шапка `Header` уменьшена с 80px до 56px (`h-14`), в `Features` убраны раздутые вложенные карточки ("Как это работает"), компактные скелетоны A4 в `TemplatesShowcase`, вертикальные отступы секций уменьшены до `py-10 sm:py-20`.
  - **Dashboard Hero Responsive**: Заголовки снабжены `break-words` и уменьшены до `text-2xl sm:text-4xl`, центрирование имени пользователя (например, MURAT ORYNBAEV) не ломается на мобильных экранах.
  - **Resume Builder Mobile Tabs**: Добавлен мобильный таб-переключатель (`[ Настройки ]` / `[ Предпросмотр ]`) на экранах `< lg`. Устранена необходимость бесконечного скролла форм перед просмотром A4. В `AppLayout.tsx` для маршрутов резюме убраны двойные внешние отступы (`p-0` на мобильных), исключая зауживание рабочей зоны до узкой полосы.
  - **Templates 2-Column Grid & 100% Free Templates Everywhere**: Сетка шаблонов перестроена в 2 столбца (`grid-cols-2`) на всех экранах, убраны длинные описания (3-5 слов). Полностью удалены бейджи FREE и PRO. В бэкенде (`ResumeController.java`) удален `PRO_TEMPLATES` и проверки 403 Forbidden — все 6 шаблонов бесплатны для всех пользователей без ограничений. В `ResumeBuilder.tsx` удален бейдж PRO и блокировки.
  - **Verification**: 265 backend tests PASS, 41/41 frontend Vitest PASS, Vite production build clean, Next.js 15 build clean (9/9 static routes). Изменения отправлены в `origin main`.

## Active Backlog
- **Native Mobile App (Expo)**: Инициализация и разработка нативного приложения MeDev на React Native + Expo (авторизация, Job Tracker, AI ассистент, просмотр скора).
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Retrieval:** `VectorizationService` пишет векторы в pgvector при `ProfileUpdatedEvent`. Реализация semantic search: Job Tracker → AI Match по вакансии.
