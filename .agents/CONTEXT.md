# Current Project Context

## Status
- **Project Stage**: Level 4 — Production Live (Production Deployed: Render backend + Vercel frontend, 266 backend + 41 frontend tests)
- **Developer Level**: Senior / Tech Lead
- **Live Infrastructure**:
  - **Frontend**: Custom Domain (`https://medev.mrsgemaseny.com`) + Vercel (`https://me-dev-two.vercel.app`) + GitHub Pages (`https://mrsgemaseny.github.io/MeDev/`), `@vercel/analytics`, `vercel.json` SPA rewrites.
  - **Backend API**: Render Web Service (`https://medev-backend.onrender.com/api`), Docker, Java 17, Spring Boot 3.3.0.
  - **Database**: Render PostgreSQL 17 (`medev-postgres`, Flyway V26).
  - **Cache & Redis**: Render Redis (`medev-redis`, Valkey 8.1.4) + In-Memory Caffeine L1 (`profiles`, `public-profiles`).
  - **AI Model**: `openai/gpt-oss-20b` (GPT-20B) via Groq API. СТРОГО: Модели Llama НЕ РАБОТАЮТ и запрещены. Работает ТОЛЬКО `openai/gpt-oss-20b`.
- **Monorepo Structure**:
  - `backend/`: Spring Boot 3.3.0 (Java 17, PostgreSQL 17, Redis, Groq AI).
  - `frontend/`: Vite + React 19 SPA (`app.medev.mrsgemaseny.com`, Dashboard, Resume Builder, ATS).
  - `landing/`: Next.js 15 App Router SSG (`medev.mrsgemaseny.com`, Marketing, SEO, OpenGraph).

## Latest Milestones & Features (2026-09-10)
1. **5-Axis Security and Architectural Audit & Remediation (100% COMPLETE)**:
   - **Backend Security & Hardening**: Fixed OAuth2 Java Serialization RCE (using JSON + AES). Strengthened JWT claims. Removed wildcard header `*` from CORS `allowedHeaders`. Sanitized `authenticationEntryPoint` JSON output against injection. Centralized origin whitelist in `SecurityOrigins`. Purged reset token from application logs. Hardened `getClientIp` against spoofed `X-Forwarded-For` using rightmost hop.
   - **Backend Architecture & Stability**: Eliminated N+1 queries using `Set` collections and `@EntityGraph`. Fixed Redis rate limiter crashes by adding `StringRedisTemplate`. Removed DB mutation side-effects from `AiRateLimiter` hot path. Enabled `@EnableScheduling` for hourly subscription expiration job. Removed automatic experience generation from GitHub organizations. Removed dead `OptimisticLockingFailureException` handler. Parameterized owner username in `AdminService`.
   - **Container & Runtime Optimization**: Added `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` to Dockerfile entrypoint.
   - **Frontend Architecture (FSD)**: Migrated `shared/api/hooks` to `entities/profile` and `entities/job-tracker`. Replaced Axios with native fetch (`ADR-005a`).
   - **Frontend Performance**: Implemented `LocalErrorBoundary` and wrapped `KanbanBoard` elements in `React.memo` to eliminate drag-and-drop re-renders.

2. **Test User Data Cleanup & Admin Management (100% COMPLETE)**:
   - **Flyway V25**: `V25__cleanup_test_data.sql` удаляет всех синтетических пользователей.
   - **Admin UI**: В `AdminDashboardPage.tsx` добавлена кнопка "Очистить тестовые данные". В `AdminUsersPage.tsx` добавлена колонка Username и кнопки удаления каждого аккаунта.

3. **100% Free Resume Templates Everywhere (100% COMPLETE)**:
   - Все 6 шаблонов полностью бесплатны для всех пользователей как при превью, так и при экспорте PDF/HTML.

4. **Mobile UI Compaction & Mobile Navigation**:
   - Сайдбар скрыт на экранах <768px, внедрен выезжающий drawer `MobileNavDrawer.tsx`.
   - Редактор резюме снабжен табами на мобильных экранах.

5. **Complete Light & Dark Mode Architecture (100% COMPLETE)**:
   - Полноценная светлая палитра GitHub Light и строгая тёмная палитра GitHub Dark.
   - Переключение темы с сохранением стейта.

6. **JF-1C i18n Architecture Adoption & Localization Overhaul (100% COMPLETE)**:
   - Выровнена архитектура по стандарту JF-1C. Добавлен LanguageSwitcher RU/EN.

7. **Profile Data Overhaul & Desktop UX Polish (100% COMPLETE)**:
   - **Flyway V26**: `V26__clean_spoken_languages_and_update_profile.sql`.
   - **Desktop UX**: Восстановлена полноценная прокрутка листа А4 на мониторах ПК.

## Verification
- `backend`: 266/266 тестов успешно пройдены (`./gradlew test`).
- `frontend`: сборка Vite прошла без ошибок (`npm run build`).
- `landing`: сборка Next.js 15 прошла без ошибок (`npm run build`).

## Active Backlog
- **Native Mobile App (Expo)**: Инициализация и разработка нативного приложения MeDev на React Native + Expo.
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Retrieval:** `VectorizationService` пишет векторы в pgvector при `ProfileUpdatedEvent`. Реализация semantic search: Job Tracker → AI Match по вакансии.
