# Epic-02-profile: Profile

## Мета

| Поле | Значение |
|---|---|
| **Домен** | Profile |
| **Роли** | USER, ADMIN |
| **Статус** | Done |
| **Миграции** | V2-V9 |
| **Зависит от** | Epic-01 |
| **Блокирует** | Epic-03, Epic-05, Epic-06, Epic-08 |

---

## Зачем этот эпик

Профиль — ядро продукта: данные, из которых генерируется резюме и портфолио. Без этого эпика нет CRUD для experience, education, skills, languages, projects, нет drag-and-drop порядка секций.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-02.1 | USER | заполнять и редактировать все секции профиля | иметь актуальное резюме | Done |
| US-02.2 | USER | менять порядок секций и элементов (drag-and-drop) | управлять акцентами | Done |
| US-02.3 | USER | экспортировать профиль в JSON и Markdown README | переиспользовать данные вне платформы | Done |
| US-02.4 | USER | управлять публичностью профиля | решать кто видит портфолио | Done |
| US-02.5 | USER | редактировать только свои записи (IDOR protection) | никто не изменит профиль перебором ID | Done |
| US-02.6 | ADMIN | видеть профили пользователей | модерировать контент | Done |

---

## Out of Scope

- AI-генерация контента — Epic-05
- Импорт из GitHub — Epic-04

---

## Технические решения

- **SRP-декомпозиция** — ExperienceService, EducationService, SkillService, LanguageService, ProjectService, ProfileService; без god-objects.
- **Ownership через `SecurityUtils.getCurrentUserId()` + `entity.getProfile().getId().equals(profile.getId())`** — IDOR protection на уровне записей.
- **Reorder с batch-ownership-проверкой** — все ID должны принадлежать юзеру и кол-во совпадает.
- **MapStruct (`ProfileMapper`)** — типобезопасный маппинг.
- **Pessimistic lock для Smart Merge** — `importParsedResume` использует `findByUserIdForUpdate`.
- **`ProfileUpdatedEvent` (event-driven)** — async-векторизация (Epic-05).
- **Section order в JSONB** — `profiles.section_order` без миграций схемы.

---

## Acceptance Criteria

- [x] [US-02.1] 6 секций с add/update/delete (`@Valid`)
- [x] [US-02.2] `PUT /v1/profile/{section}/reorder` с ownership-проверкой всех ID
- [x] [US-02.3] `GET /v1/profile/readme` (markdown) и `GET /v1/profile/export/json`
- [x] [US-02.4] `is_public=false` → 404 через `/v1/portfolio/{username}`
- [x] [US-02.5] Чужая сущность → 403 Forbidden
- [x] [US-02.6] `/admin/users` с пагинацией

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

- [WARNING] `updateFromGitHub`/`importProjects` НЕ используют `findByUserIdForUpdate` (в отличие от `importParsedResume`). Ручная дедупликация 'in case of previous race conditions' — сигнал прошлой гонки.
- [INFO] Мёртвая колонка `profiles.github_token` (ECB-конвертер) — код не пишет в неё; токен в `users.github_access_token` (GCM).

---

## Связанные ресурсы

- Миграции: `V2__create_profiles.sql` — `V9__add_section_order.sql`
- Контроллер: `modules/profile/controller/ProfileController.java`
- Сервисы: `modules/profile/service/` (7 сервисов)
- Маппер: `modules/profile/dto/ProfileMapper.java`
- Тесты: `backend/src/test/java/com/medev/modules/profile/`
- Frontend: `frontend/src/pages/profile/`, `features/profile/`, `widgets/profile-editor/`
