# Epic-12-frontend: Frontend Platform

## Мета

| Поле | Значение |
|---|---|
| **Домен** | Cross |
| **Роли** | USER, ADMIN, Гость |
| **Статус** | Done |
| **Миграции** | нет миграций |
| **Зависит от** | Epic-10 |
| **Блокирует** | ничего |

---

## Зачем этот эпик

Фронтенд-платформа: FSD, роутинг с охраной, dark mode, i18n, Zustand + React Query, code-splitting. Без этого эпика нет UI поверх API.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-12.1 | Гость | видеть лендинг без авторизации | понять продукт до регистрации | Done |
| US-12.2 | USER | навигироваться с охраной приватных роутов | не попасть в чужой раздел | Done |
| US-12.3 | ADMIN | видеть админ-разделы по роли | не видеть USER-функционал | Done |
| US-12.4 | Любая | работать в GitHub Dark Mode | единый визуальный язык | Done |
| US-12.5 | Любая | i18n (RU/EN) | работать на родном языке | Done |
| US-12.6 | USER | авто-рефреш access-токена (interceptor) | не замечать истечение сессии | Done |

---

## Out of Scope

- SSR/SSG — нет (SPA на Pages)
- E2E — нет

---

## Технические решения

- **FSD (строго)** — app → pages → widgets → features → entities → shared.
- **Code-splitting** — `React.lazy()` + Suspense.
- **Zustand (persist) + React Query** — global vs server state.
- **Axios interceptor** — авто-рефреш при 401, queue, logout при failed refresh, logout при 404 на /profile.
- **GitHub Dark Mode** — `#0d1117`/`#161b22`/`#30363d`/`#238636`. Без glassmorphism.
- **i18next** — RU/EN.

---

## Acceptance Criteria

- [x] [US-12.1] `/` → LandingPage
- [x] [US-12.2] PrivateRoute/PublicRoute
- [x] [US-12.3] AdminGuard + hasRole('ADMIN')
- [x] [US-12.4] dark mode enforced
- [x] [US-12.5] `shared/i18n/`
- [x] [US-12.6] `shared/api/axios.ts`

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

- [WARNING] Фронтенд-тесты не запускаются в CI.
- [INFO] Нет e2e.
- [INFO] CONTEXT.md утверждает 'uninstalled @dnd-kit', но SortableList/KanbanBoard импортируют — устарело.

---

## Связанные ресурсы

- App: `frontend/src/app/`
- Pages: `frontend/src/pages/`
- State: `frontend/src/entities/*/model/`
- API: `frontend/src/shared/api/axios.ts`
- Tests: `frontend/src/**/*.test.tsx`
