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

## 2. Промышленное развертывание: Render + Vercel

### Frontend (Vercel)
- **Production URL:** `https://me-dev-two.vercel.app`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (`tsc -b && vite build`)
- **Output Directory:** `dist`
- **Routing Configuration:** `frontend/vercel.json` (SPA rewrite `/(.*)` → `/index.html`)
- **Base Path (`vite.config.ts`):** `/` для Vercel и локала, `/MeDev/` только при `--mode github`
- **Environment Variables (Vercel):**
  - `VITE_API_URL`: `https://medev-backend.onrender.com/api/v1`

### Backend & Infrastructure (Render)
- **Web Service:** `medev-backend` (`https://medev-backend.onrender.com`)
  - **Environment:** Docker
  - **Region:** Ohio / Virginia (US East)
  - **Root Directory:** `backend`
  - **Dockerfile Path:** `backend/Dockerfile`
- **Database (PostgreSQL):** `medev-postgres` (PostgreSQL 17, Virginia US East, Free)
- **Cache (Redis):** `medev-redis` (Valkey 8.1.4, Virginia US East, Internal: `redis://red-da4um7e417fc73dkk4d0:6379`)
- **Environment Variables (Render):**
  - `SPRING_PROFILES_ACTIVE`: `prod`
  - `DATABASE_URL`: `jdbc:postgresql://<host>:5432/medev`
  - `DATABASE_USERNAME`: `postgres`
  - `DATABASE_PASSWORD`: `<db-password>`
  - `REDIS_HOST`: `red-da4um7e417fc73dkk4d0`
  - `REDIS_PORT`: `6379`
  - `REDIS_PASSWORD`: ``
  - `JWT_SECRET`: `<jwt-secret-min-256-bits>`
  - `ENCRYPTION_SECRET`: `<unique-prod-secret-min-32-chars>`
  - `GROQ_API_KEY`: `gsk_...`
  - `GROQ_MODEL`: `openai/gpt-oss-20b`
  - `CORS_ALLOWED_ORIGINS`: `https://me-dev-two.vercel.app`
  - `STRIPE_SECRET_KEY`: `sk_test_...`
  - `STRIPE_WEBHOOK_SECRET`: `whsec_...`
  - `STRIPE_PRO_PRICE_ID`: `price_...`
  - `KASPI_MERCHANT_ID`: `dummy-merchant`
  - `KASPI_SECRET_KEY`: `dummy-secret-key`

---

## 3. Альтернативное развертывание на Fly.io

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
3. Установка секретов и деплой:
   ```bash
   fly secrets set SPRING_PROFILES_ACTIVE=prod ...
   fly deploy
   ```