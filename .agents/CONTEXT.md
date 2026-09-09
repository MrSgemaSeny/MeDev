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
  - **AI Chat Stream**: Устранена склейка слов и чисел ("в90дней", "на40%") за счет передачи структурированного JSON `{ "content": chunk }` в `AiController.java` и исключения `.trim()` / `substring(1)` на фронтенде. В `assistant_system_v1.txt` внедрен запрет галлюцинирования метрик и обязательные уточняющие вопросы по целям пользователя.
  - **Resume PRO Gating**: Исправлен 403 Forbidden на шаблонах `apple-modern`, `milky-soft`, `phub-orange`. В `ResumeController.java` добавлен пропуск для пользователей с ролью `Role.ADMIN`. На фронтенде добавлен визуальный бейдж PRO и перехват 403 с автоматическим вызовом модалки апгрейда `openUpsell()`. Автоматический апгрейд аккаунта владельца (`mrsgemaseny`) до `ADMIN` и `PRO`.

## Active Backlog
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Retrieval:** `VectorizationService` пишет векторы в pgvector при `ProfileUpdatedEvent`. Реализация semantic search: Job Tracker → AI Match по вакансии.
- **Async PDF:** Перевод тяжелой генерации PDF на `ThreadPoolTaskExecutor(core=1, max=2)` + 202 Accepted паттерн при росте нагрузки.


