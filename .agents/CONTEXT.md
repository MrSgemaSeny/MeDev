# Current Project Context

## Status
- **Project Stage**: Level 4 — Production Live (Production Deployed: Render backend + Vercel frontend, 253 backend + 37 frontend tests)
- **Developer Level**: Senior / Tech Lead
- **Live Infrastructure**:
  - **Frontend**: Custom Domain (`https://medev.mrsgemaseny.com`) + Vercel (`https://me-dev-two.vercel.app`) + GitHub Pages (`https://mrsgemaseny.github.io/MeDev/`), `@vercel/analytics`, `vercel.json` SPA rewrites.
  - **Backend API**: Render Web Service (`https://medev-backend.onrender.com/api`), Docker, Java 17, Spring Boot 3.3.0.
  - **Database**: Render PostgreSQL 17 (`medev-postgres`, Flyway V24).
  - **Cache & Redis**: Render Redis (`medev-redis`, Valkey 8.1.4) + In-Memory Caffeine L1 (`profiles`, `public-profiles`).
  - **AI Model**: `openai/gpt-oss-20b` (GPT-20B) via Groq API. СТРОГО: Модели Llama НЕ РАБОТАЮТ и запрещены. Работает ТОЛЬКО `openai/gpt-oss-20b`.
- **Latest Work (2026-09-07 Landing Page & Custom Domain)**:
  - **Landing Page for `medev.mrsgemaseny.com`**: Разработан полноценный лендинг в GitHub Dark Mode эстетике (`Header`, `Hero` с интерактивным терминалом и Dev карточкой, 4-pillar Bento Grid `Features`, `TemplatesShowcase` для 6 PDF-шаблонов, `Pricing` с тарифами Kaspi/Stripe, `Faq`, `Footer`).
  - **Custom Domain `medev.mrsgemaseny.com`**: Настроен CNAME в Namecheap на `cname.vercel-dns.com`, обновлен CORS (`cors.allowed-origins`) и `app.frontend-url` на бэкенде.
  - **L1 Caffeine Cache & Transaction Synchronization**: In-memory кэш Caffeine для публичного портфолио (`/api/v1/portfolio/:username`) с TransactionSynchronizationManager.afterCommit().
- **Test Baseline**: 253 backend tests passing (100% green), 38 frontend tests passing (100% green via `npm test`), 0 build/lint warnings.

## Active Backlog
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Retrieval (незаконченная фича):** `VectorizationService` пишет векторы в pgvector при каждом `ProfileUpdatedEvent`, но `vectorStore.similaritySearch()` нигде не вызывается. Приоритет реализации: Job Tracker → AI Match по вакансии через семантический поиск по опыту пользователя. См. `[[knowledge/arch-rag-indexing-vs-retrieval]]`.
- **Async PDF:** Генерация PDF синхронная — 3 параллельных запроса убивают 0.1 CPU. Нужен `ThreadPoolTaskExecutor(core=1, max=2)` + 202 Accepted паттерн.


