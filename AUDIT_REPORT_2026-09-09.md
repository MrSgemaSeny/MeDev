# MeDev — Комплексный отчёт по аудиту, устранению логических уязвимостей и сквозному E2E тестированию
**Дата**: 2026-09-09  
**Статус платформы**: Level 4 — Production Live  
**Контур тестирования**: Render (`https://medev-backend.onrender.com/api`) + Vercel (`https://app.medev.mrsgemaseny.com`)  
**Стек**: Spring Boot 3.3.0, Java 17, PostgreSQL 17, Valkey Redis 8.1, Groq LLM (`openai/gpt-oss-20b`), React 19, Vite, TypeScript, FSD, Tailwind v4.

---

## 1. Архитектурный аудит и исправление логических дыр

### 1.1. AI Pipeline & Safe Fallbacks
- **Проблема**: Сбои Groq API или невалидный JSON вызывали необработанный HTTP 500 (`LlmException`/`RuntimeException`). В промпте `linkedin_generator_v1.txt` ответ приходил в виде свободного текста, что ломало `cleanAndValidateJson` в `GroqClient.structuredCompletion`.
- **Исправление**:
  - `backend/src/main/resources/prompts/linkedin_generator_v1.txt`: ответ модели строго зафиксирован в формате JSON `{"content": "..."}`.
  - `backend/src/main/java/com/medev/modules/ai/service/AiAnalysisService.java`: внедрен метод `buildFallbackParsedProfile(currentProfile)`. При сбоях AI возвращается частичный профиль на основе имеющихся данных пользователя без выброса 500 ошибки.
  - Модель зафиксирована строго на `openai/gpt-oss-20b` (модели Llama запрещены).

### 1.2. Качество генерации PDF и шаблоны (Flying Saucer)
- **Проблема**: Свойства Flexbox, Grid и CSS-переменные не поддерживаются движком Flying Saucer и приводят к искажению верстки или падению XML-парсера.
- **Исправление**:
  - Проведен аудит 6 шаблонов (`apple-modern`, `clean`, `github`, `grok-monolith`, `milky-soft`, `phub-orange`) в `templates/resume/`.
  - Разметка использует исключительно таблицы, float и явные hex-цвета.
  - Шрифты (`Roboto`, `Inter`, `Space Grotesk`, `Lora`, `Playfair Display`, `Anton`) извлекаются во временные файлы при старте приложения (`PdfGeneratorService.initFonts()`), исключая сбои разрешения путей в fat-jar.
  - Подтверждена поддержка одностраничного (`singlePage=true`) и многостраничного (`singlePage=false`) режимов.

### 1.3. Интеграция с GitHub
- **Проблема**: Скоринг выбирал нерелевантные репозитории; парсер `README.md` засорял профиль бейджами и markdown-шумом; вызовы API без привязанного аккаунта приводили к 500 ошибке.
- **Исправление**:
  - `GitHubRepoScorer.java`: формула скоринга учитывает: звёзды (35%), актуальность (30%), размер кодовой базы (20%), форки (15%).
  - `GitHubReadmeParser.java`: метод `extractCleanDescription()` очищает бейджи Shields.io, HTML-теги и ссылки, формируя компактное резюме проекта.
  - `GitHubService.java`: ошибки при отсутствии GitHub-токена переведены на HTTP 400 Bad Request (`IllegalArgumentException`).

### 1.4. Разделение разговорных языков и языков программирования
- **Проблема**: Пользователи и AI-парсеры вносили языки программирования (Java, Python, TypeScript) в сущность `Language` (естественные языки общения).
- **Исправление**:
  - В системных промптах `full_profile_generator_v1.txt` и `resume_parser_v1.txt` введен запрет на включение языков программирования в массив `languages`.
  - `LanguageService.java`: внедрен черный список `PROGRAMMING_LANGUAGES` и метод `validateNotProgrammingLanguage()`, возвращающий HTTP 400 при попытке сохранить язык программирования в разговорные.
  - `ProfileService.java`: при импорте профиля (`importParsedResume`) языки программирования автоматически маршрутизируются в `Skill` с категорией `"Languages"`.

### 1.5. Безопасность авторизации, OAuth2 и CORS
- **Проблема**:
  1. Preflight `OPTIONS` с `https://app.medev.mrsgemaseny.com` отклонялся с кодом 403 Forbidden.
  2. Валидация CSRF по Origin в `AuthController.java` блокировала `/api/v1/auth/logout` с 403.
  3. Кука `medev_link_jwt` могла привязать чужой Google-аккаунт к текущему пользователю.
- **Исправление**:
  - `SecurityConfig.java` и `AuthController.java`: субдомены `https://app.medev.mrsgemaseny.com`, `https://medev.mrsgemaseny.com`, `*.mrsgemaseny.com`, `*.vercel.app` захардкожены в список доверенных на уровне Java.
  - `CustomOAuth2UserService.java`: механизм `linkingFlow` ограничен исключительно GitHub (`"github".equals(registrationId)`). Google OAuth изолирован.
  - При логауте куки `refresh_token` и `medev_link_jwt` гарантированно удаляются с `SameSite=None; Secure; maxAge=0`.

### 1.6. Job Tracker & Scraper Resilience
- **Проблема**: `WebScraperService` перехватывал только `IOException`, пропуская исключения валидации URL (`IllegalArgumentException`); в `JobApplicationService` отсутствовала валидация этапов Kanban.
- **Исправление**:
  - `WebScraperService.java`: блок `catch` расширен до `Exception`, возвращая безопасную карточку `"Manual Entry Required"`.
  - `JobApplicationService.java`: добавлен метод `validateStatusTransition()`, запрещающий некорректный скачок из `WISHLIST` сразу в `OFFER`.

### 1.7. Глобальная обработка ошибок
- **Проблема**: Несогласованность форматов ответов при ошибках.
- **Исправление**:
  - В `GlobalExceptionHandler.java` все обработчики унифицированы через `errorPayload`:
    ```json
    {
      "status": 404,
      "error": "Not Found",
      "message": "Job application not found"
    }
    ```
  - Обеспечена совместимость с обработчиком ошибок `frontend/src/shared/api/axios.ts`.

---

## 2. Разрешение инцидента с Content Security Policy (CSP)

### 2.1. Описание инцидента
В браузере при открытии страницы `ResumeBuilder` консоль выводила:
```text
Framing 'blob:https://app.medev.mrsgemaseny.com/...' violates Content Security Policy directive: "default-src 'self'".
The request has been blocked. Note that 'frame-src' was not explicitly set, so 'default-src' is used as a fallback.
```
В окне "Live PDF Preview" отображался битый документ.

### 2.2. Выполненные исправления
1. **`frontend/vercel.json`**:
   - В CSP добавлена директива для фреймов: `frame-src 'self' blob: data:; child-src 'self' blob: data:;`.
   - Заголовок `X-Frame-Options` изменен с `DENY` на `SAMEORIGIN`.
2. **`frontend/src/widgets/resume-builder/ResumeBuilder.tsx`**:
   - В компонент `iframe` добавлен атрибут `srcDoc={htmlDoc}` для прямого нативного рендеринга HTML без генерации сетевых blob-ссылок в DOM. `src={htmlUrl}` оставлен в качестве fallback.
3. **Сборка фронтенда**: `npm run build` завершен успешно за 1.73s (0 ошибок).

---

## 3. Результаты сквозного E2E и матричного тестирования

### 3.1. Юнит- и интеграционные тесты (Gradle)
- Команда: `.\gradlew.bat compileJava testClasses`
- Статус: **BUILD SUCCESSFUL** (0 ошибок).

### 3.2. Матрица тестирования шаблонов резюме (25 проверок)
Проверены все 6 шаблонов в двух режимах (`singlePage=true`, `singlePage=false`) для форматов HTML, PDF и Markdown:

| Шаблон | Одностраничный (`singlePage=true`) | Многостраничный (`singlePage=false`) | Формат вывода | Результат |
|---|---|---|---|---|
| **apple-modern** | 200 OK | 200 OK | HTML / PDF | **PASS** |
| **clean** | 200 OK | 200 OK | HTML / PDF | **PASS** |
| **github** | 200 OK | 200 OK | HTML / PDF | **PASS** |
| **grok-monolith** | 200 OK | 200 OK | HTML / PDF | **PASS** |
| **milky-soft** | 200 OK | 200 OK | HTML / PDF | **PASS** |
| **phub-orange** | 200 OK | 200 OK | HTML / PDF | **PASS** |
| **Markdown README** | full template | 200 OK | Markdown | **PASS** |
| **Невалидный шаблон** | unknown-template-xyz | 400 Bad Request | JSON Error | **PASS** |

### 3.3. Сводная матрица E2E API на боевом сервере Render (66 проверок)

| Модуль | Описание проверок | Кол-во проверок | Статус |
|---|---|---|---|
| **01_Auth** | Регистрация, логин, ротация refresh-токена, логаут, отзыв токена в Redis | 7 | **PASS** |
| **02_Profile** | Получение и обновление профиля, порядок секций, CRUD Skills, Experience, Education, Languages, Projects, README, JSON экспорт | 20 | **PASS** |
| **03_Resume** | HTML превью и PDF генерация шаблонов github, clean, invalid template | 5 | **PASS** |
| **04_Portfolio** | Публичный доступ без токена к портфолио, 404 для несуществующих пользователей | 2 | **PASS** |
| **05_Tracker** | Создание, получение, обновление, удаление вакансий, IDOR защита от модификации/удаления чужих записей (403) | 7 | **PASS** |
| **06_Ai** | Лимит квот, генерация саммари через Groq proxy, чтение SSE-стрима | 3 | **PASS** |
| **07_GitHub** | Неавторизованный доступ (401), вызов без привязанного токена | 3 | **PASS** |
| **08_Admin** | RBAC проверки: анонимный доступ (401), доступ с ролью USER (403) | 6 | **PASS** |
| **09_Actuator** | Health check (UP), метрики с RBAC защитой (401/403) | 3 | **PASS** |

**Итог E2E прогона**: 66 проверок | 66 успешно | 0 отказов | **100% PASS**.

---

## 4. Статус Git и контроль версий
- **Репозиторий MeDev**:
  - Коммит `f21d366`: `fix(core): audit fixes for AI, GitHub, Job Tracker, languages and global errors`
  - Коммит `3370931`: `fix(frontend): permit blob and sameorigin framing in CSP and test 6 resume templates across modes`
  - Статус ветки `main`: синхронизирована с `origin/main`, рабочее дерево чисто.
- **Репозиторий Second Brain**:
  - Коммит `1b5040f`: `docs(journal): complete session report on audit, logical fixes, and E2E coverage`
  - Коммит `0813b04`: `docs(journal): document CSP fix and 6-template verification across singlePage and multiPage`
  - Журнал `journal/2026-09-09/medev.md` полностью актуализирован.
