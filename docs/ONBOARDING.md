# Руководство по онбордингу (ONBOARDING.md)

Пошаговая инструкция для быстрого разворачивания и запуска MeDev на локальном компьютере.

---

## 1. Требования к окружению

- **JDK**: 17 (Eclipse Temurin / OpenJDK)
- **Node.js**: 20+
- **PostgreSQL**: 15+ (с расширением `pgvector`)
- **Redis**: 6+
- **Git**: 2.30+

---

## 2. Клонирование

```bash
git clone https://github.com/MrSgemaSeny/MeDev.git
cd MeDev
```

---

## 3. Быстрый старт (Docker Compose)

Поднимает PostgreSQL (pgvector) + Redis + backend + frontend одной командой:

```bash
docker-compose up -d
```

- Backend: http://localhost:8080/api
- Frontend: http://localhost:5173

> Требуется `backend/.env` с секретами (см. раздел 4).

---

## 4. Ручная настройка (без Docker)

### 4.1. База данных

```sql
CREATE DATABASE medev;
CREATE USER test_user WITH PASSWORD 'pass1';
GRANT ALL PRIVILEGES ON DATABASE medev TO test_user;
-- расширение pgvector
\c medev
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4.2. Переменные окружения бэкенда

Создайте `backend/.env`:

```env
# БД
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5435/medev
SPRING_DATASOURCE_USERNAME=test_user
SPRING_DATASOURCE_PASSWORD=pass1

# Redis
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379

# JWT
JWT_SECRET=super_secret_jwt_key_that_is_at_least_256_bits_long_for_hs256_algorithm_12345
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=2592000000

# Шифрование (AES-256-GCM, минимум 32 байта)
ENCRYPTION_SECRET=super_secret_encryption_key_that_is_at_least_32_bytes_long_12345

# AI
GROQ_API_KEY=your_groq_api_key

# OAuth2
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Stripe (опционально для биллинга)
STRIPE_API_KEY=sk_test_12345
STRIPE_WEBHOOK_SECRET=whsec_12345
STRIPE_PRO_PRICE_ID=price_12345

# Kaspi (mock)
KASPI_MERCHANT_ID=dummy-merchant
KASPI_SECRET_KEY=dummy-secret-key
```

### 4.3. Запуск бэкенда

```bash
cd backend
./gradlew bootRun
```

- При первом запуске Flyway применит миграции `V1`..`V23`.
- Бэкенд на http://localhost:8080/api

### 4.4. Тесты бэкенда

```bash
./gradlew test
```

Используются Testcontainers (PostgreSQL, Redis) — Docker должен быть запущен.

---

## 5. Фронтенд

### 5.1. Установка

```bash
cd frontend
npm install
```

### 5.2. Переменные окружения

Создайте `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### 5.3. Dev-сервер

```bash
npm run dev
```

Приложение на http://localhost:5173

### 5.4. Тесты

```bash
npm test        # vitest run
npm run lint    # oxlint
```

---

## 6. Архитектура и правила

Перед началом работы обязательно прочтите:
- [ARCHITECTURE.md](./ARCHITECTURE.md) — архитектура и модули
- [CONTRIBUTING.md](./CONTRIBUTING.md) — правила (Flyway, секреты, тесты)
- [../CLAUDE.md](../CLAUDE.md) — инструкции для AI-агентов
- [../Epics/Plan/](../Epics/Plan/) — эпики и user stories

---

## 7. Типовые задачи

### Добавить новую колонку в БД
1. Создай `backend/src/main/resources/db/migration/V24__add_<desc>.sql`
2. НЕ модифицируй существующие миграции
3. Обнови entity (Hibernate `ddl-auto=validate` проверит схему при старте)

### Добавить новый API-эндпоинт
1. Определи модуль (`auth`, `profile`, `ai`, ...)
2. Создай controller в `modules/<module>/controller/`
3. Используй `SecurityUtils.getCurrentUserId()` для ownership
4. Добавь ownership-проверку для update/delete
5. Покрой тестом в `src/test/java/com/medev/modules/<module>/`

### Добавить AI-генерацию
1. Добавь промпт в `resources/prompts/<name>_v1.txt`
2. Используй `AiGenerateService` (structured) или `AiAssistantService` (streaming)
3. Применяй `AiRateLimiter.checkAndConsume(userId)` в controller
4. Для PRO-only — вызывай `SubscriptionService.assertPro(userId)`
