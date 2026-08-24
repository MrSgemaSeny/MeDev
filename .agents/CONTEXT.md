# Current Project Context

## Status
- **Project Stage**: Level 4 — Production Live (Production Deployed: Render backend + Vercel frontend, 253 backend + 37 frontend tests)
- **Developer Level**: Senior / Tech Lead
- **Live Infrastructure**:
  - **Frontend**: Vercel (`https://me-dev-two.vercel.app`), `@vercel/analytics`, `vercel.json` SPA rewrites.
  - **Backend API**: Render Web Service (`https://medev-backend.onrender.com/api`), Docker, Java 17, Spring Boot 3.3.0.
  - **Database**: Render PostgreSQL 17 (`medev-postgres`, Flyway V24).
  - **Cache & Redis**: Render Redis (`medev-redis`, Valkey 8.1.4).
  - **AI Model**: `openai/gpt-oss-20b` via Groq API.
- **Latest Work (2026-08-24 Security & Architecture Audits)**:
  - **AI Streaming Fixes**: Fixed 502/TCP fragmentation in SSE streams via `X-Accel-Buffering: no` and buffered client chunk concatenation. Fixed `GroqClient` circuit breaker predicate (only trip on 5xx/timeouts, not 4xx).
  - **Security Audits (IDOR/Leaks/OOM)**: Restricted AI prompt limits to prevent token exhaustion. Fixed Redis race condition in rate limits. Secured Stripe/Kaspi webhook cache invalidation. Added strict `@Size` limits to Tracker DTOs to prevent database bloat. Fixed `PortfolioService` leaking hidden projects. Added WebClient `.timeout()` everywhere to prevent hanging threads.
- **Test Baseline**: 253 backend tests passing (100% green via `.\gradlew.bat test`), 37 frontend tests passing (100% green via `npm test`), 0 build/lint warnings.

## Active Backlog
- Configure custom domain (e.g. `medev.kz` / `medev.dev`).
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.


