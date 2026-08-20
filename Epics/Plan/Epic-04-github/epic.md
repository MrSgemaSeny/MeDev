# Epic-04-github: GitHub Integration

## Мета

| Поле | Значение |
|---|---|
| **Домен** | GitHub |
| **Роли** | USER |
| **Статус** | Done |
| **Миграции** | V11, V20 |
| **Зависит от** | Epic-01, Epic-02 |
| **Блокирует** | Epic-05 |

---

## Зачем этот эпик

GitHub — заявленный 'единственный источник правды' для техпрофиля. Без этого эпика профиль заполняется только руками; эпик обеспечивает импорт репозиториев, языков, организаций, README tech-stack и snapshot для AI.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-04.1 | USER | подключить GitHub (OAuth2) | автоматически подтягивать данные | Done |
| US-04.2 | USER | импортировать топ репозиториев как проекты | не копировать описания руками | Done |
| US-04.3 | USER | получить языки по байтам кода | иметь реальный stack | Done |
| US-04.4 | USER | иметь snapshot GitHub-данных с timestamp | AI генерировал из свежих данных | Done |
| US-04.5 | USER | видеть статистику коммитов за 90 дней | подтвердить активность | Done |
| US-04.6 | USER | выбрать какие репозитории импортировать | не тащить форки | Done |

---

## Out of Scope

- Импорт приватных репо в AI-контекст — backlog
- Парсинг организаций в Experience.company — roadmap Phase 1 (частично)

---

## Технические решения

- **`GitHubService.fetchAndParseProfile`** — параллельный Reactor фетч: /user, /user/repos (100, сортировка по скору), языки top-10, README top-5, /user/orgs.
- **`GitHubRepoScorer`** — скоринг для ранжирования (stars, forks, size, updated_at).
- **`GitHubReadmeParser`** — regex-парсинг ~40 известных технологий из README.
- **`GithubSnapshot` (composite PK user_id+fetched_at)** — raw JSON для AI-генерации.
- **`GitHubGraphQLService`** — contributions за 90 дней через GraphQL с кэшем Redis.
- **AES-256-GCM шифрование `github_access_token`** через `EncryptedStringConverter`.

---

## Acceptance Criteria

- [x] [US-04.1] OAuth2 сохраняет зашифрованный токен
- [x] [US-04.2] `POST /v1/github/import` с `selectedRepoIds` (с дедупликацией)
- [x] [US-04.3] `languageStats` — байты, не счётчик
- [x] [US-04.4] `github_snapshots` raw JSON с `fetched_at`
- [x] [US-04.5] `GitHubGraphQLService.fetchContributionsCached`
- [x] [US-04.6] `GitHubImportRequest.selectedRepoIds` фильтрует

---

## Definition of Done

- [x] Все US из таблицы выше реализованы или явно перенесены в другой эпик с указанием куда
- [x] Flyway-миграции добавлены и проверены на чистой БД
- [x] Smoke/интеграционные тесты покрывают happy path каждой US
- [x] Секреты только в env vars / Fly secrets, не в коде
- [x] Нет raw stack trace в ответах API (ошибки через GlobalExceptionHandler)
- [x] CI/CD pipeline зелёный (все тесты проходят перед деплоем)
- [x] Эпик задеплоен и проверен вручную

---

## Известные ограничения / технический долг

- [WARNING] `fetchUserPublicRepos` тянет БЕЗ авторизации (публичные 10 шт) — используется в `AiContextService`. Теряет приватные проекты. Roadmap Phase 1.
- [INFO] `GitHubReadmeParser` — статический список ~40 технологий.

---

## Связанные ресурсы

- Миграции: `V11__add_github_oauth_fields.sql`, `V20__create_github_snapshots.sql`
- Контроллер: `modules/github/controller/GitHubController.java`
- Сервисы: `GitHubService.java`, `GitHubGraphQLService.java`, `GitHubReadmeParser.java`, `GitHubRepoScorer.java`
- Тесты: `backend/src/test/java/com/medev/modules/github/`
- Frontend: `frontend/src/features/github/`
