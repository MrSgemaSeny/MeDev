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
- **Latest Work (2026-09-07 Full 37-Point Compliance, Accessibility, Legal & Security Hardening — 100% COMPLETE)**:
  - **Compliance & Legal (Items 1–19)**: WCAG 2.1 AA контрастность (`--color-text-muted`), семантичные alt-описания, 14-дневная политика возврата (`/refund`), исчерпывающие Privacy/Terms (ЗРК № 94-V, GDPR), доступность форм (WAI-ARIA, `focus-visible`, `<label htmlFor>`), Cookie-баннер (`localStorage`), реквизиты ИП Орынбасар М. (Алматы, РК), минимизация данных, устранение абсолютных маркетинговых клеймов.
  - **Security Hardening (Items 20–37)**:
    - *XSS & CSRF (20-21)*: Санитизация URL (`sanitizeUrl`), строгий CSP (`default-src 'self'`), `X-Frame-Options: DENY`, проверка `Origin` против белого списка и заголовок `X-Requested-With: XMLHttpRequest` для cookie-эндпоинтов (`/auth/refresh`, `/auth/logout`).
    - *Uploads & Traversal (22-23)*: Блокировка PDF-бомб памяти (`document.getNumberOfPages() > 30`), magic bytes `%PDF`, regex-проверка промптов `^[a-zA-Z0-9_-]+$`.
    - *SSRF (24)*: Whitelist хостов GitHub, запрет авто-редиректов в `PdfGeneratorService`, фильтрация приватных (RFC 1918), loopback и cloud metadata IP.
    - *Password Reset & Sessions (25-26)*: Одноразовый 256-бит токен в Redis (15 мин TTL), anti-enumeration ответы, аннулирование refresh-сессий, черный список JWT в Redis (`blacklist:access:<token>`) при логауте с валидацией в `JwtFilter`.
    - *Secrets, CORS, Rate Limits (27-29)*: Fail-fast проверка 256-бит JWT-секрета при старте, запрет `*` в CORS с credentials, трехуровневый Bucket4j rate limiting (auth 20, public 60, ai 10 req/min).
    - *Envs, Credentials, Webhooks (30-32)*: Защита Actuator (`ADMIN` role), Swagger отключен в prod, валидация Stripe (`Webhook.constructEvent`) и Kaspi Pay (HMAC-SHA256 константное сравнение).
    - *Payment Checks, IDOR, Logs & Maps (33-37)*: Серверные проверки PRO-плана (`assertPro`), изоляция данных через `SecurityUtils.getCurrentUserId()`, маскирование токенов в логах, сокрытие стек-трейсов, `sourcemap: false` в Vite и Next.js.
  - **Test Baseline**: 255/255 backend tests green (100%), 38/38 frontend tests green (100%), Next.js SSG build: 9/9 static pages generated.

## Active Backlog
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Retrieval (незаконченная фича):** `VectorizationService` пишет векторы в pgvector при каждом `ProfileUpdatedEvent`, но `vectorStore.similaritySearch()` нигде не вызывается. Приоритет реализации: Job Tracker → AI Match по вакансии через семантический поиск по опыту пользователя. См. `[[knowledge/arch-rag-indexing-vs-retrieval]]`.
- **Async PDF:** Генерация PDF синхронная — 3 параллельных запроса убивают 0.1 CPU. Нужен `ThreadPoolTaskExecutor(core=1, max=2)` + 202 Accepted паттерн.


