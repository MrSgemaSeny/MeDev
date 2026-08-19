# Epic-10-infra: Infrastructure & CI/CD

## Мета

| Поле | Значение |
|---|---|
| **Домен** | Infra |
| **Роли** | ADMIN |
| **Статус** | Done |
| **Миграции** | нет миграций |
| **Зависит от** | нет зависимостей |
| **Блокирует** | ничего |

---

## Зачем этот эпик

Инфраструктура и CI/CD: Docker, GitHub Actions, деплой на Fly.io + GitHub Pages, структурированные логи, branch protection. Без этого эпика нет воспроизводимого окружения и безопасного пайплайна доставки.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-10.1 | ADMIN | поднять всё одной командой (docker-compose) | разрабатывать без ручной настройки | Done |
| US-10.2 | ADMIN | CI на каждый PR (backend + frontend build) | не вмерджить сломанный код | Done |
| US-10.3 | ADMIN | деплоить фронт на GitHub Pages автоматически | публичный доступ без ручных шагов | Done |
| US-10.4 | ADMIN | branch protection (PR + status checks) | не запушить в main напрямую | Done |
| US-10.5 | ADMIN | структурированные JSON-логи в prod | агрегировать и искать | Done |

---

## Out of Scope

- Staging — нет (roadmap)
- Бэкапы БД по расписанию — нет

---

## Технические решения

- **`docker-compose.yml`** — pgvector/pgvector:pg15, redis:alpine, backend, frontend.
- **`ci.yml`** — backend `./gradlew build` (с тестами), frontend `npm run build`. На push/PR в main.
- **`deploy.yml`** — frontend на GitHub Pages при `frontend/**`.
- **Branch protection** — require PR + status checks (`backend-build-and-test`, `frontend-build`).
- **`logback-spring.xml`** — Logstash JSON + MDC (userId, requestId).
- **`fly.toml` + `Dockerfile`** — деплой на Fly.io.

---

## Acceptance Criteria

- [x] [US-10.1] `docker-compose up -d`
- [x] [US-10.2] CI зелёный на PR
- [x] [US-10.3] Push в `frontend/**` → Pages
- [x] [US-10.4] Push в main заблокирован
- [x] [US-10.5] Prod-логи в JSON

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

- [WARNING] Фронтенд-тесты НЕ запускаются в CI (`ci.yml` только build, нет `npm test`).
- [INFO] Нет staging (деплой main→prod напрямую).
- [INFO] Нет nightly-бэкапов БД.
- [INFO] `ServerPortCustomizer` сканирует порты 8080–8083.

---

## Связанные ресурсы

- CI/CD: `.github/workflows/ci.yml`, `deploy.yml`
- Docker: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`
- Deploy: `backend/fly.toml`
- Logging: `backend/src/main/resources/logback-spring.xml`
