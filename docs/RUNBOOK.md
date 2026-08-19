# Регламент эксплуатации и ликвидации инцидентов (RUNBOOK.md)

Порядок деплоя, проверки работоспособности и действия при сбоях в продакшн-среде MeDev.

---

## 1. Продакшн-окружение и URL

- **Backend API**: `https://<app>.fly.dev/api` (Fly.io)
- **Health Check**: `https://<app>.fly.dev/api/actuator/health`
- **Prometheus метрики**: `https://<app>.fly.dev/api/actuator/prometheus`
- **Frontend SPA**: GitHub Pages (`https://<owner>.github.io/MeDev`)
- **БД**: PostgreSQL (Fly.io managed / self-hosted) + pgvector
- **Cache**: Redis (Fly.io)

---

## 2. Процесс релиза и деплоя (CI/CD)

Деплой выполняется автоматически через GitHub Actions.

### Фронтенд (GitHub Pages)
- `.github/workflows/deploy.yml` запускается при push в `main` с изменениями в `frontend/**`.
- Шаги: install → `npm run build` → upload artifact → deploy на GitHub Pages.

### Бэкенд (Fly.io)
- Деплой через `fly.toml` + `Dockerfile` (вручную или через будущий `deploy-backend.yml`).
- ```bash
  cd backend
  flyctl deploy --app <app-name>
  ```

### CI (проверки на PR)
- `.github/workflows/ci.yml` на push/PR в `main`:
  - Backend: `./gradlew build` (включая тесты)
  - Frontend: `npm run build`
- Branch protection: require PR + status checks (`backend-build-and-test`, `frontend-build`).

---

## 3. Резервное копирование БД

> [WARNING] Автоматические nightly-бэкапы НЕ настроены (backlog). Добавить по образцу JF-1C (`db-backup.yml` + Telegram-нотификация).

### Ручной бэкап
```bash
flyctl proxy 5432:5432 -a <db-app>
pg_dump -h localhost -p 5432 -U postgres -d medev -Fc -f backup.dump
```

### Ручное восстановление
```bash
flyctl proxy 5432:5432 -a <db-app>
pg_restore -h localhost -p 5432 -U postgres -d medev --clean backup.dump
```

---

## 4. Дерево ликвидации инцидентов

### Сценарий A: 401 на всех запросах после истечения access-токена
- **Симптом**: Фронт получает 401, interceptor пытается refresh, тоже 401, выкидывает на /login.
- **Причина**: Refresh-токен истёк (30 дней) или удалён из Redis (logout/revoke).
- **Действие**: Нормальное поведение. Пользователь должен залогиниться заново. Проверить `redis-cli KEYS "refresh:*"`.

### Сценарий B: OAuth2 редирект не доходит до фронта
- **Симптом**: После GitHub/Google логина висит на callback.
- **Причина**: `oauth2_code` в Redis истёк (TTL 5 мин) или `frontend-url` в `application-prod.yml` неверный.
- **Действие**: Проверить `cors.allowed-origins` и `app.frontend-url` в env Fly.io. Проверить Redis ключ `oauth2_code:<code>`.

### Сценарий C: AI-генерация возвращает 429 Too Many Requests
- **Симптом**: Пользователь получает 429 на `/v1/ai/*`.
- **Причина**: Превышена дневная квота (FREE=10/день, PRO=100/день) ИЛИ Groq rate-limited (429 от провайдера).
- **Действие**:
  - Проверить Redis: `GET "ai_limit:{userId}:{date}"`.
  - Проверить логи `[AiRateLimiter] User X exceeded daily AI limit`.
  - Если Groq 429 — CircuitBreaker/Retry должны справиться; проверить `[GroqClient] Rate limited by Groq`.

### Сценарий D: Бэкенд на Fly.io непрерывно перезапускается
- **Симптом**: Health Check 502/timeout, контейнер restart loop.
- **Причина**: Несовпадение Flyway checksum (модифицировали существующую миграцию) ИЛИ OOM ИЛИ недоступна БД/Redis.
- **Действие**:
  1. `flyctl logs --app <app>` — найти root cause.
  2. Если Flyway checksum: **КАТЕГОРИЧЕСКИ ЗАПРЕЩЁН `flywayClean` на прод-БД!** Откатить изменение миграции, выпустить компенсирующую `V{N+1}__...sql`.
  3. Если OOM: увеличить memory в `fly.toml`, проверить `HikariCP` pool size.
  4. Если БД/Redis недоступны: `flyctl proxy` + проверить connectivity.

### Сценарий E: Stripe webhook не апгрейдит юзера до PRO
- **Симптом**: Оплата прошла, план остался FREE.
- **Причина**: Неверный `STRIPE_WEBHOOK_SECRET`, подпись не прошла, ИЛИ `metadata.userId` отсутствует в checkout session.
- **Действие**:
  - Проверить логи `[StripeService] Stripe webhook signature verification failed`.
  - В Stripe Dashboard → Webhooks → проверить endpoint и events.
  - Проверить, что checkout session создаётся с `.putMetadata("userId", ...)`.

### Сценарий F: PDF генерация падает с FontException
- **Симптом**: `GET /v1/resume/generate/{template}` → 500, лог `PDF font loading failed`.
- **Причина**: Шрифт не найден в classpath (fonts/*.ttf) или не извлечён в temp-файл.
- **Действие**: Проверить `backend/src/main/resources/fonts/`. `PdfGeneratorService.initFonts()` логирует `WARN: Font X not found`.

### Сценарий G: CORS error на фронте
- **Симптом**: `Cross-Origin Resource Sharing` в консоли.
- **Причина**: `cors.allowed-origins` не содержит origin фронта.
- **Действие**: Проверить `CORS_ALLOWED_ORIGINS` в Fly.io secrets (через запятую для нескольких).

---

## 5. Откат релиза на Fly.io

```bash
flyctl releases list --app <app>
flyctl releases rollback v<НОМЕР> --app <app>
```

---

## 6. Мониторинг

- **Health**: `/api/actuator/health` (permitAll)
- **Prometheus**: `/api/actuator/prometheus` (требует auth, кроме health)
- **Логи**: JSON (Logstash encoder) с MDC `userId`, `requestId`.

> [INFO] Внешний scrape/alerting (Prometheus/Grafana/UptimeRobot) — не настроен (Epic-11 Planned).
