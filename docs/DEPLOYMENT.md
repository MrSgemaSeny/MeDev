# MeDev — Руководство по развертыванию (Deployment Guide)

Документ описывает процедуру запуска и промышленного развертывания платформы MeDev.

---

## 1. Локальный запуск (Docker Compose)

Полный стек (PostgreSQL, Redis, Backend, Frontend) поднимается одной командой:

```bash
docker-compose up --build -d
```

### Доступные сервисы:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432` (db: `medev`, user: `postgres`)
- Redis: `localhost:6379`

---

## 2. Развертывание бэкенда на Fly.io

Бэкенд контейнеризирован и конфигурируется через `fly.toml` и `Dockerfile`.

### Шаги деплоя:
1. Авторизация в Fly.io CLI:
   ```bash
   fly auth login
   ```
2. Создание приложения и привязка PostgreSQL / Redis:
   ```bash
   fly launch --no-deploy
   fly postgres attach <your-postgres-app>
   fly redis create
   ```
3. Установка секретов окружения:
   ```bash
   fly secrets set \
     SPRING_PROFILES_ACTIVE=prod \
     DATABASE_URL=jdbc:postgresql://<host>:5432/<db> \
     DATABASE_USERNAME=<user> \
     DATABASE_PASSWORD=<password> \
     REDIS_HOST=<redis-host> \
     REDIS_PORT=6379 \
     JWT_SECRET=<jwt-secret-at-least-256-bits> \
     ENCRYPTION_SECRET=<encryption-secret-32-chars> \
     GROQ_API_KEY=<groq-api-key> \
     STRIPE_SECRET_KEY=<stripe-secret-key> \
     STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret> \
     STRIPE_PRO_PRICE_ID=<stripe-price-id>
   ```
4. Развертывание:
   ```bash
   fly deploy
   ```

---

## 3. Развертывание фронтенда (GitHub Pages / Vercel / Cloudflare Pages)

Frontend автоматически собирается и деплоится через GitHub Actions workflow `.github/workflows/deploy-pages.yml` при каждом пуше в ветку `main`.

### Переменные окружения сборки:
- `VITE_API_URL`: публичный URL бэкенда (например, `https://medev-api.fly.dev/api/v1`).