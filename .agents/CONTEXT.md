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
- **Monorepo Structure**:
  - `backend/`: Spring Boot 3.3.0 (Java 17, PostgreSQL 17, Redis, Groq AI).
  - `frontend/`: Vite + React 19 SPA (`app.medev.mrsgemaseny.com`, Dashboard, Resume Builder, ATS).
  - `landing/`: Next.js 15 App Router SSG (`medev.mrsgemaseny.com`, Marketing, SEO, OpenGraph).
- **Latest Work (2026-09-07 Next.js 15 SSG Landing Monorepo)**:
  - **Next.js 15 App Router in `landing/`**: Создан изолированный SSG модуль лендинга с полным OpenGraph/SEO, `sitemap.ts`, `robots.ts`, Tailwind CSS v4 и строгим GitHub Dark Mode.
  - **Multi-Zone Subdomain Pattern**: `medev.mrsgemaseny.com` (Next.js) + `app.medev.mrsgemaseny.com` (Vite SPA).
- **Test Baseline**: 253 backend tests passing (100% green), 38 frontend tests passing (100% green via `npm test`), Next.js SSG build: 8/8 static pages generated.

## Active Backlog
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Retrieval (незаконченная фича):** `VectorizationService` пишет векторы в pgvector при каждом `ProfileUpdatedEvent`, но `vectorStore.similaritySearch()` нигде не вызывается. Приоритет реализации: Job Tracker → AI Match по вакансии через семантический поиск по опыту пользователя. См. `[[knowledge/arch-rag-indexing-vs-retrieval]]`.
- **Async PDF:** Генерация PDF синхронная — 3 параллельных запроса убивают 0.1 CPU. Нужен `ThreadPoolTaskExecutor(core=1, max=2)` + 202 Accepted паттерн.


