# Epic-11-observability: Observability & Monitoring

## Мета

| Поле | Значение |
|---|---|
| **Домен** | Infra |
| **Роли** | ADMIN |
| **Статус** | Planned |
| **Миграции** | нет миграций |
| **Зависит от** | Epic-10 |
| **Блокирует** | ничего |

---

## Зачем этот эпик

Без observability инциденты в prod невидимы до жалоб. Эпик обеспечивает метрики (Prometheus), health, uptime и alerting.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-11.1 | ADMIN | видеть health-check | диагностировать недоступность | Planned |
| US-11.2 | ADMIN | Prometheus-метрики (JVM, Hikari, HTTP) | наблюдать производительность | Planned |
| US-11.3 | ADMIN | uptime-мониторинг | узнать о падении раньше пользователей | Planned |
| US-11.4 | ADMIN | alerting на критические ошибки | реагировать в SLA | Planned |

---

## Out of Scope

- Distributed tracing — нет
- Log aggregation — частично (JSON готов, агрегатора нет)

---

## Технические решения

- **Actuator (health, metrics, prometheus)** — сконфигурирован в `application-prod.yml`.
- **Health check** — `/api/actuator/health` permitAll.

---

## Acceptance Criteria

- [ ] [US-11.1] `/api/actuator/health` (реализовано)
- [ ] [US-11.2] `/api/actuator/prometheus` (реализовано, scrape — нет)
- [ ] [US-11.3] Uptime — нет
- [ ] [US-11.4] Alerting — нет

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

- [INFO] Actuator открыт, но внешний scrape/alerting не настроен.

---

## Связанные ресурсы

- Config: `backend/src/main/resources/application-prod.yml`
- Security: `SecurityConfig.java` (actuator/health permitAll)
