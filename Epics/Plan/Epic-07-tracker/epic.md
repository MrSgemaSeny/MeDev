# Epic-07-tracker: Job Tracker

## Мета

| Поле | Значение |
|---|---|
| **Домен** | Tracker |
| **Роли** | USER (FREE/PRO) |
| **Статус** | Done |
| **Миграции** | V17, V21 |
| **Зависит от** | Epic-01, Epic-02, Epic-05 |
| **Блокирует** | ничего |

---

## Зачем этот эпик

Job Tracker — киллер-фича: трекер вакансий с AI-матчингом, парсингом JD по URL, адаптацией резюме. Без него MeDev — только генератор, без цикла поиска работы.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-07.1 | USER | CRUD заявки на вакансию | вести учёт откликов | Done |
| US-07.2 | USER | вставить URL и распарсить данные | не копировать JD руками | Done |
| US-07.3 | USER | получить AI match-score и feedback | оценить соответствие | Done |
| US-07.4 | USER | видеть статус (WISHLIST/APPLIED/INTERVIEW/OFFER/REJECTED) | управлять пайплайном | Done |
| US-07.5 | USER | управлять только своими заявками (IDOR) | никто не видит мои отклики | Done |

---

## Out of Scope

- Канбан (dnd-kit) — реализован, но CRM-таблица основной

---

## Технические решения

- **`JobApplicationService.getOwnedEntity`** — ownership через `entity.getUser().getId().equals(userId)`.
- **`WebScraperService` (tracker)** — парсинг hh.kz/hh.ru/linkedin; whitelist хостов + loopback/private check.
- **AI match-job** — переиспользует `AiApplicationService.matchJob` (Epic-05).
- **`ApplicationStatus`** — enum WISHLIST/APPLIED/INTERVIEW/OFFER/REJECTED.

---

## Acceptance Criteria

- [x] [US-07.1] CRUD `/v1/tracker/applications` (`@Valid`)
- [x] [US-07.2] `GET /v1/tracker/applications/scrape?url=` → CreateJobApplicationRequest
- [x] [US-07.3] `POST /v1/ai/match-job` → score + feedback
- [x] [US-07.4] Статус из enum, `updatedAt` для сортировки
- [x] [US-07.5] Чужая заявка → 403

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

- [INFO] `WebScraperService` (tracker) не кэширует DNS (в отличие от ai-версии) — теоретический TOCTOU, но whitelist снижает риск.

---

## Связанные ресурсы

- Миграции: `V17__create_job_applications.sql`, `V21__add_matching_fields_to_job_applications.sql`
- Контроллер: `modules/tracker/controller/JobApplicationController.java`
- Сервисы: `JobApplicationService.java`, `WebScraperService.java`
- Frontend: `frontend/src/pages/tracker/`, `features/job-tracker/`
