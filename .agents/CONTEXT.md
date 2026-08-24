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
- **Latest Work (2026-08-23 Deployment & Environment Fixes)**:
  - **Compile & Docker Fix**: Resolved `ProfileService` `LocalDate` type mismatch and missing import; added `chmod +x gradlew` in Dockerfile.
  - **Antigravity Stabilisation**: Disabled blocking PowerShell lifecycle hooks in `hooks.json` and deduplicated `config.json`.
  - **Auth & Routing**: Implemented dynamic `redirect_uri` in OAuth2 (GitHub/Google) flow via cookie preservation; added `vercel.json` SPA rewrites.
  - **Environment Separation**: Clean DEV (`localhost:5173` / `localhost:8080`) and PROD (`me-dev-two.vercel.app` / `medev-backend.onrender.com`) profiles.
- **Test Baseline**: 253 backend tests passing (100% green via `.\gradlew.bat test`), 37 frontend tests passing (100% green via `npm test`), 0 build/lint warnings.

## Active Backlog
- Configure custom domain (e.g. `medev.kz` / `medev.dev`).
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.


