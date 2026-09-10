# Current Project Context

## Status
- **Project Stage**: Level 4 — Production Live (Production Deployed: Render backend + Vercel frontend, 266 backend + 41 frontend tests)
- **Developer Level**: Senior / Tech Lead
- **Live Infrastructure**:
  - **Frontend**: Custom Domain (`https://medev.mrsgemaseny.com`) + Vercel (`https://me-dev-two.vercel.app`) + GitHub Pages (`https://mrsgemaseny.github.io/MeDev/`), `@vercel/analytics`, `vercel.json` SPA rewrites.
  - **Backend API**: Render Web Service (`https://medev-backend.onrender.com/api`), Docker, Java 17, Spring Boot 3.3.0.
  - **Database**: Render PostgreSQL 17 (`medev-postgres`, Flyway V25).
  - **Cache & Redis**: Render Redis (`medev-redis`, Valkey 8.1.4) + In-Memory Caffeine L1 (`profiles`, `public-profiles`).
  - **AI Model**: `openai/gpt-oss-20b` (GPT-20B) via Groq API. СТРОГО: Модели Llama НЕ РАБОТАЮТ и запрещены. Работает ТОЛЬКО `openai/gpt-oss-20b`.
- **Monorepo Structure**:
  - `backend/`: Spring Boot 3.3.0 (Java 17, PostgreSQL 17, Redis, Groq AI).
  - `frontend/`: Vite + React 19 SPA (`app.medev.mrsgemaseny.com`, Dashboard, Resume Builder, ATS).
  - `landing/`: Next.js 15 App Router SSG (`medev.mrsgemaseny.com`, Marketing, SEO, OpenGraph).

## Latest Milestones & Features (2026-09-10)
1. **Test User Data Cleanup & Admin Management (100% COMPLETE)**:
   - **Flyway V25**: `V25__cleanup_test_data.sql` удаляет всех синтетических пользователей (`art_%`, `usr_%`, `auth_%`, `profile_%`, `e2e_%`, `*@testmail.com`, `*@medev-test.local`) и тестовые записи аудита, сохраняя реальный аккаунт владельца (`mrsgemaseny`).
   - **Admin API**: `POST /v1/admin/cleanup-test-data` и `DELETE /v1/admin/users/{userId}` с защитой от удаления собственного аккаунта администратора.
   - **Admin UI**: В `AdminDashboardPage.tsx` добавлена кнопка "Очистить тестовые данные" с индикацией и авто-обновлением метрик. В `AdminUsersPage.tsx` добавлена колонка Username и кнопки удаления каждого аккаунта.
   - **SecurityUtils**: Поддержка `UserDetails` и строковых ID в `getCurrentUserId()`.

2. **100% Free Resume Templates Everywhere (100% COMPLETE)**:
   - Из `ResumeController.java` полностью удален список `PRO_TEMPLATES` и проверки 403 Forbidden. Все 6 шаблонов (Clean ATS, GitHub, Milky Soft, Apple, Grok, PH Orange) полностью бесплатны для всех пользователей как при превью, так и при экспорте PDF/HTML.
   - В `ResumeBuilder.tsx` и на лендинге удалены все бейджи PRO/FREE и пейволлы. Шаблоны представлены в 2-колоночной сетке (`grid-cols-2`) с ультра-лаконичным описанием (3-5 слов).

3. **Mobile UI Compaction & Mobile Navigation**:
   - Сайдбар скрыт на экранах <768px, внедрен выезжающий drawer `MobileNavDrawer.tsx`.
   - Редактор резюме снабжен табами `[ Настройки ]` / `[ Предпросмотр ]` на мобильных экранах.
   - Устранен эффект гигантских блоков на мобильных экранах лендинга и дашборда.

## Verification
- `backend`: 266/266 тестов успешно пройдены (`./gradlew test`).
- `frontend`: 41/41 тест пройден (`npm test`).
- `frontend`: сборка Vite прошла без ошибок (`npm run build`).
- `landing`: сборка Next.js 15 прошла без ошибок (`npm run build`).

## Active Backlog
- **Native Mobile App (Expo)**: Инициализация и разработка нативного приложения MeDev на React Native + Expo (авторизация, Job Tracker, AI ассистент, просмотр скора).
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Retrieval:** `VectorizationService` пишет векторы в pgvector при `ProfileUpdatedEvent`. Реализация semantic search: Job Tracker → AI Match по вакансии.
