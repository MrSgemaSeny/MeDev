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
- **Latest Work (2026-09-07 Full 19-Point Compliance, Accessibility & Legal Audit — 100% COMPLETE)**:
  - **WCAG 2.1 AA Contrast**: Исправлена переменная `--color-text-muted` в `.dark` (`#8b949e`, 6.05:1) и light (`#59636e`, 4.6:1), устранены неконтрастные цвета.
  - **Descriptive Alt Text**: Все аватары и графики оснащены содержательными alt-описаниями; декоративные SVG получили `aria-hidden="true"`.
  - **Refund Policy (14-Day Guarantee)**: Внедрена страница `/refund` в Next.js лендинге и Vite SPA, ссылки интегрированы в футеры и модалку оплаты.
  - **Privacy & Terms**: Развернуты подробные юридические документы (соответствие ЗРК № 94-V, GDPR, PII-маскирование перед Groq AI, права на удаление).
  - **Accessibility (A11y)**: WAI-ARIA аккордеон FAQ, `focus-visible` кольца для клавиатуры, `aria-label` для icon-only кнопок, диалоговые роли в Modal, Skip Link.
  - **Zero Fake Reviews Verified**: Подтверждена чистота проекта от фальшивых отзывов.
  - **Cookies Policy & Banner**: Создан доступный `CookieBanner` с сохранением согласия в `localStorage`.
  - **Form Consent**: Добавлены ссылки на соглашение под формами входа/регистрации и загрузчиком PDF.
  - **Clear Button Labels (Item 14)**: Однозначные лейблы действий на кнопках лендинга, баннера («Принять необходимые»), профиля («Сохранить изменения профиля») и импорта PDF («Выбрать PDF-файл резюме»).
  - **Cookie Consent Check (Item 15)**: Регламентировано использование исключительно strictly necessary куки и localStorage, анонимная аналитика Vercel без куки.
  - **Real Business Details (Item 16)**: Внедрен блок официальных реквизитов ИП Орынбасар М. (г. Алматы, РК, support/privacy email, Telegram) во все правовые страницы и футер.
  - **Data Minimization (Item 17)**: В Политику добавлен отдельный раздел минимизации данных (GDPR ст. 5(1)(c), ЗРК № 94-V ст. 5), сбор строго ограничен профессиональными полями.
  - **Keyboard Friendly Forms (Item 18)**: `<label htmlFor>` связаны с `id`, `aria-invalid` и `role="alert"` для ошибок, дропзона PDF получила `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space), четкие кольца фокуса `Input.tsx`.
  - **Remove Unsupported Claims (Item 19)**: Устранены абсолютные и непроверяемые утверждения («все сервисы», «100% точность», «все крупные HR-платформы») и заменены на корректные стандарты ATS.
  - **Rule 11 & Domain Fix**: Модель зафиксирована как `GPT-20B` в `AiChatWidget.tsx`; все ссылки обновлены на `medev.mrsgemaseny.com`.
- **Test Baseline**: 253/253 backend tests green (100%), 38/38 frontend tests green (100%), Next.js SSG build: 9/9 static pages generated.

## Active Backlog
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Retrieval (незаконченная фича):** `VectorizationService` пишет векторы в pgvector при каждом `ProfileUpdatedEvent`, но `vectorStore.similaritySearch()` нигде не вызывается. Приоритет реализации: Job Tracker → AI Match по вакансии через семантический поиск по опыту пользователя. См. `[[knowledge/arch-rag-indexing-vs-retrieval]]`.
- **Async PDF:** Генерация PDF синхронная — 3 параллельных запроса убивают 0.1 CPU. Нужен `ThreadPoolTaskExecutor(core=1, max=2)` + 202 Accepted паттерн.


