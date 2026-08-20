# Epic-09-admin: Admin & Audit

## Мета

| Поле | Значение |
|---|---|
| **Домен** | Admin |
| **Роли** | ADMIN |
| **Статус** | Partial |
| **Миграции** | V19 |
| **Зависит от** | Epic-01 |
| **Блокирует** | ничего |

---

## Зачем этот эпик

Админ-панель + аудит-логи: управление пользователями, ролями, планами; просмотр действий для compliance. Без этого эпика нет ручного управления и нет forensic-следов.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-09.1 | ADMIN | видеть список пользователей с пагинацией | модерировать базу | Done |
| US-09.2 | ADMIN | менять роль и план | управлять доступом | Done |
| US-09.3 | ADMIN | не менять свою роль (self-protection) | не снять себе админку | Done |
| US-09.4 | ADMIN | видеть аудит-логи | расследовать инциденты | Planned |
| US-09.5 | ADMIN | видеть метрики дашборда | оценивать здоровье | Planned |

---

## Out of Scope

- Real-time admin alerts — нет
- Экспорт аудит-логов — нет

---

## Технические решения

- **`hasRole('ADMIN')` в SecurityConfig** — все `/v1/admin/**` требуют роль.
- **Self-role-change prohibition** — `changeUserRole` бросает ForbiddenException если `userId == currentUserId`.
- **`AuditService.logAction` (async)** — готов, но не wired (см. долг).
- **`AdminGuard` (frontend)** — UI-проверка, реальный gate на бэкенде.

---

## Acceptance Criteria

- [ ] [US-09.1] `GET /admin/users?page=&size=` (PageRequest)
- [ ] [US-09.2] `PUT /admin/users/{id}/plan|role`
- [ ] [US-09.3] Self-role-change → 403
- [ ] [US-09.4] `GET /admin/audit` — endpoint есть, логи пусты (см. долг)
- [ ] [US-09.5] `GET /admin/dashboard` — заглушки (см. долг)

---

## Definition of Done

- [ ] Все US из таблицы выше реализованы или явно перенесены в другой эпик с указанием куда
- [ ] Flyway-миграции добавлены и проверены на чистой БД
- [ ] Smoke/интеграционные тесты покрывают happy path каждой US
- [ ] Секреты только в env vars / Fly secrets, не в коде
- [ ] Нет raw stack trace в ответах API (ошибки через GlobalExceptionHandler)
- [ ] CI/CD pipeline зелёный (все тесты проходят перед деплоем)
- [ ] Эпик задеплоен и проверен вручную

---

## Известные ограничения / технический долг

- [WARNING] `AdminService.getDashboardStats` — заглушки: `proUsers=0`, `totalAiTokensUsedToday=0`. Реальные агрегации не реализованы.
- [WARNING] `AuditService.logAction` нигде не вызывается — модуль реализован, но не wired. Аудит-логи пусты.
- [INFO] `AdminGuard` проверяет `username === 'admin'`, а не `role`.
- [INFO] Нет пагинации на фронтенде AdminUsersPage/AdminAuditPage.

---

## Связанные ресурсы

- Миграции: `V19__create_audit_logs.sql`
- Контроллер: `modules/admin/controller/AdminController.java`
- Сервисы: `AdminService.java`, `modules/audit/service/AuditService.java`
- Тесты: `backend/src/test/java/com/medev/modules/admin/`
- Frontend: `frontend/src/pages/admin/`, `app/providers/AdminGuard.tsx`
