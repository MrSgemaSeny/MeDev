# Current Project Context

## Status
- **Project Stage**: Level 4 — Production Live (Production Deployed: Render backend + Vercel frontend, 253 backend + 37 frontend tests)
- **Developer Level**: Senior / Tech Lead
- **Live Infrastructure**:
  - **Frontend**: Vercel (`https://me-dev-two.vercel.app`) + GitHub Pages (`https://mrsgemaseny.github.io/MeDev/`), `@vercel/analytics`, `vercel.json` SPA rewrites.
  - **Backend API**: Render Web Service (`https://medev-backend.onrender.com/api`), Docker, Java 17, Spring Boot 3.3.0.
  - **Database**: Render PostgreSQL 17 (`medev-postgres`, Flyway V24).
  - **Cache & Redis**: Render Redis (`medev-redis`, Valkey 8.1.4) + In-Memory Caffeine L1 (`profiles`, `public-profiles`).
  - **AI Model**: `openai/gpt-oss-20b` via Groq API.
- **Latest Work (2026-08-27 Deployment & Cache Architecture)**:
  - **Spring Boot 4.1 Compatibility**: Dependabot-обновление доведено до рабочей сборки: Gradle 8.14.3, новые Boot 4 API/тестовые модули, `@MockitoBean`, Jackson 2 и WebClient compatibility modules. Неиспользуемый Spring Cloud Function исключён из Spring AI; полный backend build на JDK 17 проходит.
  - **GitHub Pages & Vercel Dual Deployment**: Настроен dynamic base path в `vite.config.ts` (`/MeDev/` для GitHub Pages, `/` для Vercel), скрипт `build:github`, исправлены пути к ассетам и фавикону, обновлен workflow `deploy.yml`.
  - **L1 Caffeine Cache & Transaction Synchronization**: Внедрен in-memory кэш Caffeine для публичного портфолио (`/api/v1/portfolio/:username`). Устранен race condition через `TransactionSynchronizationManager.afterCommit()`. Добавлен `PublicProfileCacheEvictListener` и `PublicRateLimiter` (60 req/min).
  - **HikariCP & Tomcat Fail-Fast Tuning**: `connection-timeout: 10s`, `maximum-pool-size: 10`, `server.tomcat.threads.max: 25`.
- **Test Baseline**: 253 backend tests passing (100% green via `.\gradlew.bat test`), 37 frontend tests passing (100% green via `npm test`), 0 build/lint warnings.

## Active Backlog
- Configure custom domain (e.g. `medev.kz` / `medev.dev`).
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Retrieval (незаконченная фича):** `VectorizationService` пишет векторы в pgvector при каждом `ProfileUpdatedEvent`, но `vectorStore.similaritySearch()` нигде не вызывается. Приоритет реализации: Job Tracker → AI Match по вакансии через семантический поиск по опыту пользователя. См. `[[knowledge/arch-rag-indexing-vs-retrieval]]`.
- **Async PDF:** Генерация PDF синхронная — 3 параллельных запроса убивают 0.1 CPU. Нужен `ThreadPoolTaskExecutor(core=1, max=2)` + 202 Accepted паттерн.

