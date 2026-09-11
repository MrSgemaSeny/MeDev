# Current Project Context

## Status
- **Project Stage**: Level 4 — Production Live (Production Deployed: Render backend + Vercel frontend, 266 backend + 41 frontend tests)
- **Developer Level**: Senior / Tech Lead
- **Live Infrastructure**:
  - **Frontend**: Custom Domain (`https://medev.mrsgemaseny.com`) + Vercel (`https://me-dev-two.vercel.app`) + GitHub Pages (`https://mrsgemaseny.github.io/MeDev/`), `@vercel/analytics`, `vercel.json` SPA rewrites.
  - **Backend API**: Render Web Service (`https://medev-backend.onrender.com/api`), Docker, Java 17, Spring Boot 3.3.0.
  - **Database**: Render PostgreSQL 17 (`medev-postgres`, Flyway V27).
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

8. **Production 500 Error Remediation (EncryptedStringConverter & EntityGraph Cartesian Product)**:
   - **EncryptedStringConverter**: Обернуты вызовы шифрования/дешифрования в try-catch с логгированием и безопасным фоллбэком на исходное строковое значение. Это полностью устраняет 500 ошибку при чтении legacy незашифрованных (`gho_...`) или пустых токенов из production PostgreSQL.
   - **ProfileRepository**: Убран 5-коллекционный `@EntityGraph`, заменен на чистый JPQL `@Query("SELECT p FROM Profile p WHERE p.user.id = :userId")`. Предотвращен взрыв Cartesian product и дублирование результатов.
   - **Hibernate Batch Fetching**: В `application.yml` добавлен `default_batch_fetch_size: 50` для защиты от N+1 при ленивой загрузке.

9. **Desktop Sidebar Redesign, Universal Hamburger Menu & Desktop Responsiveness (100% COMPLETE)**:
   - **Universal Hamburger Button**: Кнопка меню в `AppHeader` теперь доступна на всех устройствах (десктоп, планшет, мобильный). На мобильных открывает `MobileNavDrawer`, на десктопе сворачивает/разворачивает сайдбар.
   - **Desktop Sidebar Overhaul**: Новый брендовый хедер `>_ MeDev`, компактный вид (68px) с tooltips и развернутый (260px) с изумрудным активным маркером, персистентное сохранение состояния в `localStorage`.
   - **Desktop Responsiveness & Zoom Controls**: Адаптивная ширина панели в конструкторе резюме (`w-full lg:w-[300px] xl:w-[340px]`), интерактивный тулбар масштабирования превью (`Zoom Out`, `Fit %`, `Zoom In`) с авто-подгонкой при изменении размера экрана.

10. **AI Resume Parser 500 Remediation & UI De-cluttering (100% COMPLETE)**:
    - **Backend (500 Root Cause Eliminated)**: `AiExperienceDto` и `AiEducationDto` переведены с `LocalDate` на `String` (Jackson больше не падает при текстовых датах от Groq). В `ProfileService` внедрен безопасный парсер дат `parseDateSafe` и санитизация строк `truncate(str, max)`. `AiAnalysisService` ловит все PDFBox рантайм-сбои. В `GlobalExceptionHandler` добавлен перехват `DataIntegrityViolationException`.
    - **Frontend (UI Clean-up)**: Убран SVG-квадрат с терминалом и мигающая точка у логотипа `MeDev`. Убрана подпись `DEVELOPER HUB`. Удален пункт "О себе". Удалены кнопки закрытия внутри сайдбара — сайдбар открывается/закрывается только гамбургером в хедере. Из конструктора резюме вычищены все лишние описания и индикаторы.

11. **Kitapall-Style Island Drawer & Universal Header (100% COMPLETE)**:
    - **AppHeader**: Добавлен стильный логотип `MeDev` рядом с кнопкой меню `☰`, минималистичный капсульный инпут поиска `rounded-full`.
    - **Universal Island Drawer (`MobileNavDrawer`)**: Реализован дизайн со скругленными карточками-островками (`rounded-2xl`): блок главного меню со встроенным переключателем языка и темы, блок разделов резюме с подсказками, блок сервиса с тарифами, настройками и выходом. Контент приложения получил 100% ширины экрана.

12. **Drawer Polish: Segmented Theme Switcher & Monochromatic White Typography (100% COMPLETE)**:
    - **Segmented Theme Switcher**: Внедрен переключатель тем `[ 🌙 Тёмная | ☀️ Светлая ]` в едином стиле с тумблером языка.
    - **Monochromatic White Typography**: Все тексты в сайдбаре переведены на чистый белый цвет (`text-white`, `text-white/80`, `text-white/70`, `text-white/50`). Полностью удалены зеленые тексты (логотип `MeDev`, кнопка темы, пункт "Админ-панель").

13. **PostgreSQL Column Bounds Hardening (100% COMPLETE)**:
    - `languages.level`: исправлено усечение до `VARCHAR(20)` (ранее стояло 50).
    - `profiles`: добавлены усечения `truncate` для всех строковых полей (fullName, headline, location, website, githubUsername, telegram, linkedin).

14. **Job Tracker ↔ AI Resume Tailoring Integration (100% COMPLETE)**:
    - **Contract-First & API Alignment**: В `AiApplicationResponse` добавлены псевдонимы `coverLetter` и `suggestions` для обратной совместимости по Hyrum's Law.
    - **Frontend DTOs & Hooks**: Добавлены контракты `AiTailorRequest`, `AiTailorResponse`, `AiMatchRequest`, `AiMatchResponse` и хук `useTailorResume`.
    - **AiTailorModal**: Новое модальное окно для пошаговой адаптации резюме под требования вакансии с валидацией длины текста, индикацией статуса, копированием и быстрым переходом в конструктор резюме.
    - **Kanban & List Quick Actions**: В карточки KanbanBoard и строки списка Job Tracker добавлены кнопки быстрого вызова адаптации резюме (`Sparkles`) с доступностью по WCAG AA.
    - **Bugfix**: Исправлена автоподстановка распарсенного `jobDescription` в `AiCoverLetterModal`.

15. **RAG Embedding Pipeline Activation via Jina AI & PgVectorRepository (100% COMPLETE)**:
    - **Flyway V27**: `V27__update_vector_dimensions.sql` обновляет размерность `vector(384)` -> `vector(768)` с пересозданием индекса HNSW.
    - **JinaEmbeddingClient**: Высокопроизводительный WebClient HTTP-клиент к Jina AI (`jina-embeddings-v2-base-en`), исключающий OOM на JVM.
    - **PgVectorRepository**: Нативный репозиторий на чистом JdbcTemplate для batch upsert и косинусного поиска (`<=>`).
    - **Service Refactoring**: `VectorizationService` и `AiApplicationService` переведены на реальный RAG-ретривал, удалена заглушка `MockVectorStoreConfig.java`.

## Verification
- `backend`: 273/273 тестов успешно пройдены (`./gradlew test`).
- `frontend`: 55/55 тестов пройдены (`npm test`).
- `frontend`: сборка Vite прошла успешно (`npm run build`).
- `landing`: сборка Next.js 15 прошла без ошибок (`npm run build`).

## Active Backlog
- **Native Mobile App (Expo)**: Инициализация и разработка нативного приложения MeDev на React Native + Expo.
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.
- **RAG Semantic Vacancy Match (Plan B):** Векторизация вакансий из Job Tracker и автоматический двусторонний поиск под профиль пользователя.


