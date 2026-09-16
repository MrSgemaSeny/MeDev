# Current Project Context

## Status
- **Project Stage**: Level 4 — Production Live (Production Deployed: Render backend + Vercel frontend, 460 backend + 55 frontend tests)
- **Developer Level**: Senior / Tech Lead
- **Live Infrastructure**:
  - **Frontend**: Custom Domain (`https://medev.mrsgemaseny.com`) + Vercel (`https://me-dev-two.vercel.app`) + GitHub Pages (`https://mrsgemaseny.github.io/MeDev/`), `@vercel/analytics`, `vercel.json` SPA rewrites.
  - **Backend API**: Render Web Service (`https://medev-backend.onrender.com/api`), Docker, Java 17, Spring Boot 3.3.0.
  - **Database**: Render PostgreSQL 17 (`medev-postgres`, Flyway V29).
  - **Cache & Redis**: Render Redis (`medev-redis`, Valkey 8.1.4) + In-Memory Caffeine L1 (`profiles`, `public-profiles`).
  - **AI Model**: `openai/gpt-oss-20b` (GPT-20B) via Groq API. СТРОГО: Модели Llama НЕ РАБОТАЮТ и запрещены. Работает ТОЛЬКО `openai/gpt-oss-20b`.
- **Monorepo Structure**:
  - `backend/`: Spring Boot 3.3.0 (Java 17, PostgreSQL 17, Redis, Groq AI).
  - `frontend/`: Vite + React 19 SPA (`app.medev.mrsgemaseny.com`, Dashboard, Resume Builder, ATS).
  - `landing/`: Next.js 15 App Router SSG (`medev.mrsgemaseny.com`, Marketing, SEO, OpenGraph).

## Latest Milestones & Features (2026-09-16)
1. **Security, Concurrency, Architecture Decoupling & Documentation Hardening (100% COMPLETE)**:
   - **P0 Security & Concurrency (Milestone 1)**: `UrlSecurityValidator` with full CIDR/port/DNS/allowlist checks against SSRF; `AiRateLimiter` atomic Redis Lua script; dynamic TTL and eviction for user plan cache; `matchScore` server authority; `is_public=false` default; RAG tenant isolation (`user_id BIGINT NOT NULL` with cascade and index in Flyway V29).
   - **P1 Auth, Billing, Privacy & AI (Milestone 2)**: OAuth GETDEL atomic code exchange; password reset SHA-256 token hashing in Redis + `EmailDispatchService`; JWT blacklist SHA-256 token hashing; DB admin privilege validation in `AdminService` and session eviction; Stripe webhook 2-tier DB idempotency (`stripe_webhook_events`) and subscription `current_period_end` sync; LLM prompt injection delimiters (`<<< UNTRUSTED ... >>>`) and length bounds; AI resume safe non-destructive merge; RAG chunk content-hash caching; audit log PII removal.
   - **P2 Architecture Decoupling & Docs (Milestone 3)**: `WebScraperService` decomposed into 5 SRP components (`UrlSecurityValidator`, `HhVacancyClient`, `GenericPageFetcher`, `AiJobExtractor`, `ScrapeRateLimiter`) with coordinator facade; AI fallback dummy strings eliminated; embedding metadata versioning (`model`, `version`, `dimension`, `chunkHash`); `README.md` synchronized.

2. **5-Axis Security and Architectural Audit & Remediation (100% COMPLETE)**:
   - **Backend Security & Hardening**: Fixed OAuth2 Java Serialization RCE (using JSON + AES). Strengthened JWT claims. Removed wildcard header `*` from CORS `allowedHeaders`. Sanitized `authenticationEntryPoint` JSON output against injection. Centralized origin whitelist in `SecurityOrigins`. Purged reset token from application logs. Hardened `getClientIp` against spoofed `X-Forwarded-For` using rightmost hop.
   - **Backend Architecture & Stability**: Eliminated N+1 queries using `Set` collections and `@EntityGraph`. Fixed Redis rate limiter crashes by adding `StringRedisTemplate`. Removed DB mutation side-effects from `AiRateLimiter` hot path. Enabled `@EnableScheduling` for hourly subscription expiration job. Removed automatic experience generation from GitHub organizations. Removed dead `OptimisticLockingFailureException` handler. Parameterized owner username in `AdminService`.

3. **RAG Embedding Pipeline & Semantic Job Match Engine (100% COMPLETE)**:
   - Jina AI (`jina-embeddings-v2-base-en`), `PgVectorRepository` on clean JdbcTemplate, HNSW index on vector(768).
   - Asynchronous vacancy vectorization and cosine similarity match score calculation.

4. **UI & Design Polish (100% COMPLETE)**:
   - Strict GitHub dark aesthetic (#0d1117, #161b22, #30363d, #238636 accent). Zero emojis, clean navigation without subtext clutter.

## Verification
- `backend`: 460/460 тестов успешно пройдены (`./gradlew test`).
- `frontend`: 55/55 тестов пройдены (`npm test`).
- `frontend`: сборка Vite прошла успешно (`npm run build`).

## Active Backlog
- **Native Mobile App (Expo)**: Инициализация и разработка нативного приложения MeDev на React Native + Expo.
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.


