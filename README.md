# MeDev — Data-First AI SaaS Platform for Software Engineers

[![Release Status](https://img.shields.io/badge/Status-v1.0.0--RC%20%7C%20Pre--Launch%20%28Private%20Beta%29-orange?style=flat-square)](https://me-dev-two.vercel.app)
[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/MrSgemaSeny/MeDev/deploy.yml?branch=main&style=flat-square&label=CI%2FCD)](https://github.com/MrSgemaSeny/MeDev/actions)
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-253%20passed-brightgreen?style=flat-square&logo=junit5)](backend)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-37%20passed-brightgreen?style=flat-square&logo=vitest)](frontend)
[![Java](https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Valkey%208.1-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

MeDev (DevProfile) — специализированная data-first B2B/B2C SaaS-платформа для разработчиков и технических специалистов. Платформа трансформирует реальную активность инженера в GitHub (топологию репозиториев, хронологию коммитов, плотность байтов языков программирования) в подтвержденные ATS-оптимизированные резюме, публичные интерактивные портфолио и сквозной трекинг откликов на вакансии без галлюцинаций LLM.

---

## Статус Проекта и Выход на Рынок (Pre-Launch / Private Beta)

* **Текущий этап**: **v1.0.0-RC / Pre-Launch (Level 4 — Production Ready)**.
* **Инфраструктурная готовность**: Бэкенд и фронтенд полностью развернуты в боевом окружении (Render Web Service + Vercel SPA + Render PostgreSQL 17 + Render Redis Valkey + Groq LLM API), прошли стресс-тестирование (500 RPS) и аудит безопасности.
* **Доступность**: Продукт готов к коммерческой эксплуатации и находится на этапе закрытого предрелизного тестирования (Early Access) перед открытым выходом на рынок.
* **Live Production Endpoints (Early Access)**:
  * **Web Application (Vercel SPA)**: [https://me-dev-two.vercel.app](https://me-dev-two.vercel.app)
  * **Mirror / Static Build (GitHub Pages)**: [https://mrsgemaseny.github.io/MeDev/](https://mrsgemaseny.github.io/MeDev/)
  * **Backend API Base**: `https://medev-backend.onrender.com/api/v1`
  * **Actuator Health**: [https://medev-backend.onrender.com/api/actuator/health](https://medev-backend.onrender.com/api/actuator/health)


---

## Документация и База Знаний

* **[AUDIT_2026-08-27.md](AUDIT_2026-08-27.md)**: Актуальный комплексный технический аудит системы (оценка A-, Level 4 Production Ready, Chaos Engineering бенчмарки).
* **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Полный обзор архитектуры, модульный монолит, FSD-слои фронтенда, стратегия двухуровневого кэширования и модель данных.
* **[docs/ONBOARDING.md](docs/ONBOARDING.md)**: Регламент быстрого старта для инженеров (настройка локального окружения, Docker, миграции Flyway, запуск тестов).
* **[docs/RUNBOOK.md](docs/RUNBOOK.md)**: Эксплуатационный регламент, мониторинг, траблшутинг пулов HikariCP, регламент инцидентов и аварийного восстановления.
* **[docs/ADR.md](docs/ADR.md)**: Реестр архитектурных решений (ADR-001..010: выбор кэша L1 Caffeine + L2 Redis, pgvector, AES-256-GCM, FSD).
* **[docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md)**: Отчет по безопасности: защита от IDOR, RLS-изоляция, валидация криптографических ключей, аудит вебхуков.
* **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)**: Стандарты разработки, политика неизменяемости миграций Flyway, правила коммитов и качество кода.

---

## Архитектура и Технологический Стек

### Backend (Модульный монолит)
- **Core Framework**: Java 17, Spring Boot 3.3.0
- **Модульная архитектура**: 10 изолированных доменных модулей (`auth`, `profile`, `portfolio`, `github`, `ai`, `resume`, `tracker`, `billing`, `audit`, `admin`).
- **Security & Auth**: Spring Security 6, Stateless JWT (Access 24h, Refresh 30d в Redis), GitHub OAuth2, RBAC (`USER`, `ADMIN`), Row-Level Security через `SecurityUtils.getCurrentUserId()`.
- **Data & Migration**: PostgreSQL 17, Spring Data JPA, Hibernate, Flyway (цепочка миграций V1–V24), векторные расширения `pgvector`.
- **Двухуровневое кэширование (L1 + L2)**: 
  - **L1 (In-Memory Caffeine)**: регионы `profiles` и `public-profiles` для наносекундной отдачи без сетевых задержек.
  - **L2 (Redis / Valkey 8.1.4)**: распределенные сессии, токены, защита идемпотентности вебхуков.
  - **Транзакционная инвалидация**: синхронизация через `TransactionSynchronizationManager.afterCommit()` (`PublicProfileCacheEvictListener`) для предотвращения race conditions.
- **AI Core & Streaming**: Groq API (`openai/gpt-oss-20b`), реактивный WebClient, Server-Sent Events (SSE) с детерминированным закрытием подписок (`Disposable.dispose()`), PII-маскирование персональных данных.
- **Document & PDF Engine**: Thymeleaf, Flying Saucer, Apache PDFBox, локальные кириллические шрифты Roboto (без внешних `@import`).
- **Resilience & Rate Limiting**: Bucket4j (распределенный и локальный лимитер: Public 60/min, AI 10/min, Auth 5/min), HikariCP fail-fast тюнинг (`connection-timeout: 10s`, `maximum-pool-size: 10`).

### Frontend (Feature-Sliced Design)
- **Core Framework**: React 19, TypeScript 5, Vite
- **Архитектура**: Feature-Sliced Design (FSD) (`app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`).
- **State Management**: Zustand (с персистентностью), TanStack React Query v5 (дедупликация и кэширование запросов).
- **Design System**: Tailwind CSS v4, строгий GitHub Dark Mode (`#0d1117` фон, `#161b22` карточки, `#30363d` границы, `#238636` акцент). Никакого ресурсоемкого glassmorphism.
- **Interactive UI**: `@dnd-kit/core` (Канбан-доска откликов с защитой от гонок состояний), Lucide Icons, i18next (мультиязычность).

### Инфраструктура и Деплой
- **API Base Routing**: Версионированные эндпоинты `/api/v1/**`
- **Dual Frontend Deployment**: 
  - Vercel (`https://me-dev-two.vercel.app`) — SPA с rewrites в `vercel.json`.
  - GitHub Pages (`https://mrsgemaseny.github.io/MeDev/`) — динамический `base: /MeDev/` через `build:github`.
- **Backend Hosting**: Render Web Service (Docker-контейнер, Java 17, оптимизация JVM памяти для 512MB RAM).
- **База данных и Кэш**: Render PostgreSQL 17 + Render Redis (Valkey 8.1.4).
- **CI/CD**: GitHub Actions (автоматическая проверка типов, прогон 290 тестов, сборка артефактов и деплой).

---

## Архитектурная Схема Системы

```
                           +------------------------------------------+
                           |        Client Tier (React 19 / FSD)      |
                           |  Vercel / GitHub Pages Dual Deployment   |
                           +--------------------+---------------------+
                                                |
                                        HTTPS / WSS / REST
                                                |
+-----------------------------------------------v-----------------------------------------------+
|                               Spring Boot 3.3.0 Modular Monolith                              |
|                                                                                               |
|  [ Auth Module ]       [ Profile Module ]     [ Resume Module ]    [ Job Tracker Module ]     |
|  - JWT Type Segreg     - Drag-n-Drop Sort     - 6 HTML/PDF Themes  - Kanban Board (@dnd-kit)  |
|  - OAuth2 GitHub       - Smart Merge Logic    - Flying Saucer A4   - Anti-SSRF Job Scraper    |
|  - Redis Refresh TTL   - Pessimistic Locks    - Live HTML Preview  - AI Skill Gap Matcher     |
|                                                                                               |
|  [ GitHub Module ]     [ AI Core Module ]     [ Portfolio Module ] [ Billing & Audit Module ] |
|  - GraphQL Stats       - Groq LLM Proxy       - Public /:username  - Stripe & Kaspi Webhooks  |
|  - README Tech Parser  - Reactive SSE Stream  - L1 Caffeine Cache  - Redis Idempotency Locks  |
|  - Commit Chronology   - PII Masker / Tokens  - Schema.org Person  - Async Action Logging     |
+-----------------------+-----------------------+--------------------+--------------------------+
                        |                       |                    |
        +---------------+                       +-------+            +---------------+
        |                                               |                            |
+-------v-------+                               +-------v-------+            +-------v-------+
|  PostgreSQL   |                               |  Redis Cache  |            |   Groq API    |
|  Postgres 17  |                               |  Valkey 8.1   |            | gpt-oss-20b   |
|  Flyway (V24) |                               |  Sessions /   |            | Reactive SSE  |
|  AES-256-GCM  |                               |  Rate Limits  |            | Streaming     |
+---------------+                               +---------------+            +---------------+
```

---

## Ключевые Модули Системы

### 1. Синхронизация GitHub (Source of Truth)
- Автоматический расчет коммерческого стажа на основе временных меток первых коммитов и байтовой плотности языков.
- Извлечение стека технологий из файлов `README.md` и конфигураций зависимостей.
- Агрегация метаданных репозиториев в таблицу `github_snapshots` (миграция V20) для исключения избыточных вызовов GitHub API.

### 2. AI Core & Zero-Loss PDF Resume Engine
- Извлечение текста из существующих PDF через Apache PDFBox с валидацией сигнатур (`%PDF-`) и детерминированным освобождением ресурсов (try-with-resources).
- Автоматическое маскирование персональных данных (PII Masker) перед отправкой в LLM с сохранением технических тегов.
- **6 дизайн-шаблонов резюме**: `clean` (ATS Classic), `github` (Terminal Dark), `apple-modern` (Minimalist Light), `grok-monolith` (Bento Grid), `milky-soft` (Editorial), `phub-orange` (Accent Poster).
- Точный экспорт в A4 PDF через Flying Saucer + PDFBox с встроенными кириллическими глифами шрифта Roboto.

### 3. Публичное портфолио и наносекундный кэш L1
- Vanity-URL маршрутизация (`/:username` и `/p/:username`) для мгновенного веб-присутствия разработчика.
- Микросекундный отклик за счет In-Memory кэша Caffeine с автоматической инвалидацией при транзакционном коммите изменений в профиле.
- Полная генерация метатегов OpenGraph, Twitter Cards и микроразметки Schema.org `Person` (JSON-LD) для поисковой индексации.

### 4. Job Tracker CRM & AI Matcher
- Двухрежимный интерфейс: интерактивная Канбан-доска с drag-and-drop на базе `@dnd-kit` и табличное представление откликов.
- Защищенный от SSRF парсер вакансий (HeadHunter, LinkedIn).
- AI Matcher: расчет скоринга соответствия кандидата требованиям вакансии с выделением недостающих навыков (Skill Gaps).

### 5. Безопасность, Аутентификация и Шифрование
- **Защита от IDOR**: все операции строго валидируют контекст пользователя через `SecurityUtils.getCurrentUserId()`.
- **Шифрование данных**: чувствительные сторонние токены шифруются алгоритмом **AES-256-GCM** с уникальным 12-байтным вектором инициализации (IV) на каждую запись (`EncryptedStringConverter`).
- **Пессимистические блокировки**: вызовы `getProfileEntityForUpdate(userId)` (`PESSIMISTIC_WRITE`) предотвращают состояние гонки при параллельном обновлении данных.

### 6. Биллинг, Идемпотентность и Аудит
- Поддержка международных платежей (Stripe) и локального эквайринга (Kaspi Pay).
- Идемпотентная обработка вебхуков через распределенные Redis-блокировки по `orderId`.
- Полнотекстовый асинхронный аудит системных событий (`AuditService.logAction`) с фиксацией IP-адресов в `audit_logs` (миграция V19).

---

## Структура Проекта

```
MeDev/
├── backend/                   # Spring Boot 3.3.0 модульный монолит
│   ├── src/main/java/com/medev/
│   │   ├── modules/           # Доменные модули (auth, profile, portfolio, ai, resume, tracker, billing, audit)
│   │   └── shared/            # Общие компоненты (security, config, entity, exception, util)
│   ├── src/main/resources/
│   │   ├── db/migration/      # Цепочка миграций Flyway (V1..V24)
│   │   ├── templates/resume/  # HTML/CSS шаблоны резюме
│   │   └── fonts/             # Локальные шрифты Roboto
│   └── src/test/java/         # 253 Unit и Integration теста (JUnit 5, Mockito, MockMvc)
├── frontend/                  # React 19 SPA на базе Feature-Sliced Design
│   ├── src/
│   │   ├── app/               # Провайдеры, роутер, глобальные стили
│   │   ├── pages/             # Страницы (Dashboard, Profile, Resume, Tracker, Landing, Billing, Admin)
│   │   ├── widgets/           # Композитные виджеты (Landing widgets: Hero, Features, Pricing, Header, Footer)
│   │   ├── features/          # Бизнес-фичи (AI Assistant, Profile Edit, Resume Editor, Job Tracker)
│   │   ├── entities/          # Бизнес-сущности и Zustand-хранилища
│   │   └── shared/            # UI-kit, Axios клиенты, хуки, утилиты
│   └── src/test/              # 37 тестов Vitest + React Testing Library
├── docs/                      # Инженерная документация (ARCHITECTURE, RUNBOOK, ADR, API)
├── AUDIT_2026-08-27.md        # Комплексный аудит готовности к релизу
├── docker-compose.yml         # Локальная инфраструктура (PostgreSQL 17, Redis, Backend, Frontend)
└── artillery.yml              # Сценарии нагрузочного тестирования (Chaos Engineering)
```

---

## Запуск в Локальном Окружении

### Системные требования
- JDK 17+
- Node.js 20+
- Docker и Docker Compose

### 1. Запуск через Docker Compose (Полный стек)

```bash
# Клонирование репозитория
git clone https://github.com/MrSgemaSeny/MeDev.git
cd MeDev

# Поднятие всех сервисов (PostgreSQL, Redis, Backend, Frontend)
docker-compose up --build -d
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- Actuator Health Check: `http://localhost:8080/api/actuator/health`

### 2. Ручной запуск для разработки

#### База данных и Redis
```bash
docker compose up -d postgres redis
```

#### Backend
```bash
cd backend
./gradlew bootRun
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Запуск Тестов

### Backend Unit & Integration Tests (253 теста):
```bash
cd backend
./gradlew test
```

### Frontend Unit & Component Tests (37 тестов):
```bash
cd frontend
npm test
```

### Проверка сборки TypeScript и бандла:
```bash
cd frontend
npm run build
```

---

## Статус Безопасности, Нагрузочной Устойчивости и Комплаенса

- **Chaos Engineering & Стресс-устойчивость**: Система протестирована спайк-нагрузкой до 500 RPS (10 500 виртуальных пользователей за 45 сек на инстансе 0.1 CPU). Сервер выдержал нагрузку без падения JVM по памяти (нет OOM). Bucket4j Rate Limiter предотвратил деградацию базы данных, отсекая избыточный трафик ответами `429 Too Many Requests`.
- **HikariCP Fail-Fast Protection**: Таймаут получения коннекта ограничен 10 секундами, максимальный пул коннектов зафиксирован на 10, пул потоков веб-сервера ограничен 25 потоками.
- **Pessimistic Concurrency Control**: Мутации профиля защищены пессимистическими блокировками (`PESSIMISTIC_WRITE`), что исключает гонки при одновременной синхронизации нескольких репозиториев.
- **Zero Resource Leak Policy**: Все потоки ввода-вывода (PDFBox, WebClient SSE emitters) закрываются через try-with-resources и хуки `Disposable.dispose()`.
- **Flyway Immutability**: Все 24 миграции строго неизменяемы, поддержка отказоустойчивой схемы данных.
- **Защита секретов**: Длина JWT секрета валидируется при старте приложения (`@PostConstruct >= 256 bit`), токены интеграций зашифрованы в БД.

## Дорожная Карта Выхода на Рынок (Go-to-Market Roadmap)

### Фаза 1: Инженерная и Инфраструктурная Готовность (Завершена)
- [x] Развертывание боевой инфраструктуры (Render, Vercel, PostgreSQL 17, Redis Valkey, Flyway V24).
- [x] Стресс-тестирование спайками до 500 RPS (Chaos Engineering) и тюнинг HikariCP / Bucket4j.
- [x] Внедрение двухуровневого кэша L1 Caffeine + L2 Valkey с транзакционной инвалидацией.
- [x] Комплексный аудит безопасности (A- Production Ready: AES-256-GCM, RLS, IDOR defense).
- [x] Рефакторинг лендинга по стандарту FSD в строгом стиле GitHub Dark Mode.
- [x] 100% покрытие базовыми тестами (253 бэкенд + 37 фронтенд).

### Фаза 2: Закрытое Тестирование и Подготовка к Запуску (Текущий этап)
- [ ] Закрытый онбординг первых пользователей (Private Beta / Early Adopters feedback loop).
- [ ] Привязка кастомного домена (`medev.dev` / `medev.kz`) с настройкой Cloudflare DNS, WAF и SSL.
- [ ] Настройка Sentry для онлайн-мониторинга исключений и алертинга в Telegram.
- [ ] Настройка автоматического резервного копирования PostgreSQL по расписанию.
- [ ] Асинхронная очередь для тяжелых задач генерации PDF (`202 Accepted`).

### Фаза 3: Публичный Релиз и Коммерциализация (Q3/Q4 2026)
- [ ] Открытие публичной регистрации (Product Hunt, Хабр, LinkedIn, профильные сообщества).
- [ ] Перевод платежных шлюзов (Kaspi Pay / Stripe) в боевой (Live) режим.
- [ ] Запуск AI Job Match на базе векторного поиска `pgvector` в модуле Job Tracker.

---

## Лицензия

Проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).