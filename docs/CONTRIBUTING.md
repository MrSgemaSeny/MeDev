# Правила контрибьютинга MeDev

Строгие правила работы с кодом, инструментами и архитектурой. Любой агент или разработчик обязан прочесть перед внесением изменений.

---

## 1. Токен-эффективность и запрет на спам

**"ЭКОНОМИТЬ ТОКЕНЫ, НО НЕ ТУПИТЬ"**
- AI-агенты обязаны соблюдать экстремальную эффективность токенов.
- Запрещено слепо запускать глобальные поиски, читать файлы целиком, если нужна одна функция.
- Если проблема очевидна — исправляй сразу, без лишних планов.
- Минимум tool calls. Каждый LLM-вызов сжигает квоту.

---

## 2. Логическое решение проблем (без туннельного зрения)

- Сначала продумай **все** возможные причины (горизонтальный анализ), прежде чем закапываться в один файл (вертикальный).
- Не действуй по паттерну: *проблема → первая мысль → не сработало → копаем там же глубже*.
- Если команда упала — проанализируй реальную ошибку, прежде чем вслепую пробовать с другими флагами.
- Максимум 3 попытки решения одной ошибки "вслепую". Если не выходит — остановись и запроси помощь.

---

## 3. База данных и миграции (Flyway)

1. **Никогда не изменяй существующие миграции!** (V1–V23). Редактирование применённого скрипта ломает чексуммы и деплой.
2. Любые изменения БД — **только** новый файл `V{N+1}__{description}.sql`.
3. `ddl-auto=validate` — Hibernate только проверяет схему, не модифицирует.
4. `flywayClean` — **только** на локальной тестовой БД, **никогда** на staging/production.
5. Два подчёркивания между версией и описанием — обязательно: `V24__add_new_table.sql`.

---

## 4. Секреты и пароли

- **Запрещён хардкод.** Никогда не хардкодь JWT-секреты, пароли БД, `GROQ_API_KEY`, OAuth client secrets, Stripe keys.
- Все секреты — через env vars (`${SECRET_KEY}` в `application.yml` или `System.getenv()`).
- Локальные `.env` не коммитить (в `.gitignore`).

---

## 5. Безопасность (приоритет №1)

- **IDOR**: все эндпоинты берут userId из `SecurityUtils.getCurrentUserId()` (из JWT), **не из тела запроса**.
- **Ownership**: перед update/delete проверяй `entity.getProfile().getId().equals(profile.getId())` (или `entity.getUser().getId().equals(userId)`).
- **Reorder**: проверяй, что все переданные ID принадлежат юзеру и кол-во совпадает.
- **PRO gate**: для PRO-only фич вызывай `SubscriptionService.assertPro(userId)`.
- **AI sanitize**: обрезай user input до разумного размера перед передачей в LLM.

Приоритеты при конфликтах: **Security > Correctness > Performance > Code Cleanliness**.

---

## 6. Git Workflow

1. Trunk-based: работа в `main` (через PR с branch protection).
2. Коммить и пушить **только если тесты проходят**: `./gradlew test` (backend), `npm test` (frontend).
3. Запрещено пушить неработающий/некомпилируемый код.
4. Журнал: перед `git push` обязательна запись в `journal/YYYY-MM-DD/` (подкреплено git-хуком `pre-push`).

### Формат коммитов
```
feat(US-N.M): краткое описание
fix(US-N.M): краткое описание
migration(VN): краткое описание
docs: краткое описание
```

---

## 7. Архитектура

### Backend (модульный монолит)
- Модули в `com.medev.modules/<module>/` (controller, service, entity, dto, repository).
- **SRP**: сервисы компактные, без god-objects. Разноси по сервисам (ExperienceService, SkillService, ...).
- MapStruct для entity→DTO.
- Event-driven для async (ProfileUpdatedEvent → VectorizationService).

### Frontend (FSD строго)
- Слои: `shared → entities → features → widgets → pages → app`.
- Импорты **не пробивают слои вверх**.
- Zustand (persist) для global state, React Query для server state.
- Строгий GitHub Dark Mode (`#0d1117`/`#161b22`/`#30363d`/`#238636`). **Без glassmorphism.**
- Code-splitting: `React.lazy()` + Suspense для страниц.

---

## 8. Тесты

- Backend: JUnit 5 + Testcontainers (PostgreSQL, Redis). `AbstractIntegrationTest` — базовый класс.
- Frontend: vitest + @testing-library/react.
- Новая фича = новый тест.
- CI: `./gradlew build` (включая backend-тесты), `npm run build` (frontend).
- [WARNING] Фронтенд-тесты **не запускаются** в CI (только локально) — backlog.

---

## 9. Коммуникация

- **Стиль**: Senior Tech Lead. Объясняй "ПОЧЕМУ", а не только "ЧТО".
- **Эмодзи**: строго запрещены в ответах, коде, коммитах.
- **Если задача >3 шагов**: составь план (markdown) и дождись подтверждения.
- **Риск-флаги**: `[CRITICAL]`, `[WARNING]`, `[INFO]`.
- **Язык**: русский (если не оговорено иное).

---

## 10. Управление эпиками

- Все фичи описаны в `Epics/Plan/Epic-{N}-{slug}/epic.md`.
- При завершении фичи обновляй соответствующий `epic.md` (Acceptance Criteria, Definition of Done).
- При архитектурном решении обновляй `.agents/CONTEXT.md`.
- Статусы: `Done` | `In Progress` | `Partial` | `Planned`.
- Текущее кол-во эпиков: 12 (Epic-01 — Epic-12).

---

## 11. Что не трогать

- Существующие Flyway миграции V1–V23.
- `ddl-auto=validate` (всегда).
- Инфраструктуру Fly.io (если не явно запрошено).
- `AGENTS.md` / `CLAUDE.md` — только если явно запрошено владельцем.
