# MeDev

SaaS-платформа-профиль для разработчиков. Один источник правды о твоём опыте (GitHub, загруженное резюме, ручной ввод) → из него генерируются публичная портфолио-страница, PDF-резюме по шаблонам и drag-and-drop конструктор резюме по секциям.

Статус: **в разработке, не завершён.**

---

## Содержание

- [Идея проекта](#идея-проекта)
- [Функциональность](#функциональность)
- [Технологический стек](#технологический-стек)
- [Архитектура](#архитектура)
- [Структура проекта](#структура-проекта)
- [Модель данных](#модель-данных)
- [API](#api)
- [Безопасность](#безопасность)
- [Переменные окружения](#переменные-окружения)
- [Локальный запуск](#локальный-запуск)
- [Тестирование](#тестирование)
- [Деплой](#деплой)
- [Монетизация](#монетизация)
- [Известные проблемы](#известные-проблемы)
- [Roadmap](#roadmap)

---

## Идея проекта

Разработчики держат свой профессиональный опыт в разрозненных местах: GitHub-репозитории, старое резюме в Word, LinkedIn, память. MeDev собирает всё это в одну модель данных (`Profile` + `Experience` + `Education` + `Skill` + `Language` + `Project`) один раз, а дальше эта модель переиспользуется в трёх местах:

1. **Публичная страница-портфолио** — `medev.app/username`, показывает профиль как есть.
2. **Генератор резюме** — рендерит профиль в PDF по одному из готовых шаблонов.
3. **Drag-and-drop конструктор резюме** — позволяет вручную пересобрать секции резюме под конкретную вакансию, не трогая исходный профиль.

Данные в профиль попадают тремя способами: импорт из GitHub API (репозитории, языки, био), парсинг загруженного PDF-резюме, ручной ввод через форму. Часть рутины (сводка о себе, описание проекта по стеку и коммитам) можно сгенерировать через AI-ассистента.

## Функциональность

### Профиль
- Единая карточка профиля: имя, заголовок, саммари, аватар, локация, сайт, соцсети (GitHub, Telegram, LinkedIn).
- Секции: опыт работы, образование, навыки, языки, проекты — каждая с собственным CRUD и ручной сортировкой (drag-and-drop, порядок сохраняется на бэкенде).
- Настраиваемый порядок самих секций (`sectionOrder`), задаёт, что и в каком порядке показывать на публичной странице.
- Автогенерация `profile/readme` — markdown-версия профиля (например, для `README.md` в GitHub-профиле пользователя).

### Импорт из GitHub
- OAuth-логин через GitHub (и Google — как второй провайдер).
- Отдельный ручной импорт: подтягивает публичные репозитории, языки, описание профиля через GitHub API и предлагает пользователю выбрать, что импортировать.

### Резюме
- Парсинг загруженного PDF-резюме в структурированные данные (`ParsedResumeDto`) с последующим подтверждением импорта в профиль.
- Генерация PDF-резюме по шаблону из текущих данных профиля.
- AI-помощь: парсинг резюме через LLM (более гибкий, чем чисто текстовый парсер), генерация summary и описаний проектов по данным профиля.

### Портфолио
- Публичная страница по `username`, без авторизации, только для профилей с `isPublic = true`.

### AI-ассистент
- Чат-стриминг (SSE) для вопросов по резюме/профилю.
- Генерация summary и project description по данным профиля.
- Лимиты на запросы по плану пользователя (FREE / PRO), учёт токенов на каждый вызов, сбор фидбэка по качеству ответов (для дальнейшей настройки промптов).

### Биллинг
- Апгрейд FREE → PRO через Stripe Checkout.
- Обработка вебхуков Stripe с проверкой подписи.

## Технологический стек

### Backend
| Компонент | Технология |
|---|---|
| Язык / платформа | Java 17, Spring Boot 3 |
| База данных | PostgreSQL |
| Миграции | Flyway (`V1` … `V14`, версионирование строго последовательное) |
| Кэш / сессии | Redis (refresh-токены, в перспективе — AI rate-limit) |
| Авторизация | Spring Security, JWT (access + refresh), OAuth2 (GitHub, Google) |
| Rate limiting | Bucket4j (пока in-memory, на пользователя) |
| Платежи | Stripe Java SDK |
| PDF | генерация и парсинг резюме (собственные сервисы поверх PDF-библиотек) |
| LLM | Groq API (OpenAI-совместимый chat completions эндпоинт) |
| ORM | Hibernate / Spring Data JPA |

### Frontend
| Компонент | Технология |
|---|---|
| Библиотека | React 19 |
| Язык | TypeScript |
| Сборка | Vite |
| Стили | Tailwind CSS v4 (без config-файла, через CSS-переменные) |
| Состояние | Zustand (+ `persist` middleware для части auth-стора) |
| HTTP-клиент | Axios, с интерцепторами на подстановку токена и авто-рефреш |
| Drag-and-drop | dnd-kit |
| Роутинг | React Router, ленивая загрузка страниц через `lazy()` |
| Архитектура | Feature-Sliced Design (app / pages / widgets / features / entities / shared) |

## Архитектура

**Backend: модульный монолит.** Каждый бизнес-домен — отдельный пакет в `modules/` (`auth`, `profile`, `resume`, `portfolio`, `billing`, `github`, `ai`), внутри — стандартный слоёный разрез:

```
modules/<domain>/
  controller/   — HTTP-слой, валидация входных данных
  service/      — бизнес-логика, проверки владения ресурсом
  repository/   — Spring Data JPA
  entity/       — JPA-сущности
  dto/          — запросы/ответы, мапперы
```

Общий код — в `shared/` (исключения, `GlobalExceptionHandler`, JWT-сервис, `SecurityConfig`, `SecurityUtils`) и `config/` (CORS, Redis, Stripe, async, rate limit).

Выбор в пользу монолита, а не микросервисов — осознанный: на ожидаемой нагрузке (единицы-сотни пользователей на старте) микросервисы дали бы только накладные расходы на инфраструктуру без реальной пользы.

**Frontend: Feature-Sliced Design.** Слои строго однонаправленные (`app` → `pages` → `widgets` → `features` → `entities` → `shared`), нижний слой не знает о верхнем. Авторизационный стор лежит в `entities/user`, HTTP-клиент — в `shared/api`, конкретные фичи (импорт с GitHub, AI-ассистент, биллинг) — в `features/`.

## Структура проекта

```
medev/
├── backend/
│   └── src/
│       ├── main/
│       │   ├── java/com/medev/
│       │   │   ├── modules/
│       │   │   │   ├── auth/          — регистрация, логин, JWT, OAuth2
│       │   │   │   ├── profile/       — профиль + все его секции
│       │   │   │   ├── resume/        — генерация и парсинг PDF-резюме
│       │   │   │   ├── portfolio/     — публичная страница профиля
│       │   │   │   ├── billing/       — Stripe checkout + webhook
│       │   │   │   ├── github/        — импорт данных из GitHub API
│       │   │   │   └── ai/            — AI-ассистент, лимиты, учёт токенов
│       │   │   ├── shared/
│       │   │   │   ├── exception/     — доменные исключения + global handler
│       │   │   │   └── security/      — JWT, SecurityConfig, шифрование полей
│       │   │   └── config/            — CORS, Redis, Stripe, async, rate limit
│       │   └── resources/
│       │       ├── db/migration/      — Flyway V1..V14
│       │       ├── application.yml
│       │       ├── application-dev.yml
│       │       └── application-prod.yml
│       └── test/                      — юнит-тесты по модулям
└── frontend/
    └── src/
        ├── app/                       — роутер, layouts, error boundary
        ├── pages/                     — auth, dashboard, profile, resume, portfolio, billing
        ├── widgets/                   — profile-editor, resume-builder, portfolio, sidebar
        ├── features/                  — ai, ai-assistant, resume, profile, billing, github
        ├── entities/                  — resume, user, profile
        └── shared/                    — ui, api, lib, i18n
```

## Модель данных

Ядро — `User` 1:1 `Profile`, дальше от профиля расходятся секции:

- `User` — email, username, пароль (bcrypt, nullable при OAuth), роль (`USER`/`ADMIN`), план (`FREE`/`PRO`), `stripeCustomerId`, `githubId` / `githubAccessToken`, `googleId`.
- `Profile` — fullName, headline, summary, avatarUrl, location, website, `githubUsername`, `githubToken` (зашифрован отдельным конвертером), telegram, linkedin, `isPublic`, `sectionOrder` (jsonb).
- `Experience`, `Education`, `Skill`, `Language`, `Project` — секции профиля, каждая `@ManyToOne` к `Profile`, с собственным `sortOrder` для ручной сортировки.
- `AiUsage` — учёт токенов по каждому AI-вызову (модель, prompt/completion/total tokens, эндпоинт).
- `AiEvaluation` — фидбэк пользователя по качеству AI-ответов.

Миграции строго пронумерованы V1–V14, начиная от базовых таблиц (`users`, `profiles`, `experience`, `education`, `skills`, `languages`, `projects`, `subscriptions`) и заканчивая добавлением Stripe/GitHub/AI-полей и Google OAuth.

## API

Базовый путь: `/api/v1` (`context-path: /api` в Spring + `/v1` в каждом контроллере).

### Auth — `/v1/auth` (публично)
| Метод | Путь | Описание |
|---|---|---|
| POST | `/register` | регистрация по email/паролю |
| POST | `/login` | логин, возвращает access + refresh |
| POST | `/refresh` | обновление access-токена по refresh |
| POST | `/logout` | инвалидация refresh-токена текущего устройства |

### Profile — `/v1/profile` (требует авторизации)
| Метод | Путь | Описание |
|---|---|---|
| GET | `/` | получить свой профиль |
| GET | `/readme` | markdown-версия профиля |
| PUT | `/` | обновить профиль |
| PUT | `/section-order` | порядок секций на странице |
| POST/PUT/DELETE | `/experience`, `/education`, `/skills`, `/languages`, `/projects` | CRUD по каждой секции |
| PUT | `.../reorder` | ручная сортировка внутри секции |

### Resume — `/v1/resume` (требует авторизации)
| Метод | Путь | Описание |
|---|---|---|
| GET | `/generate/{template}` | сгенерировать PDF по шаблону |
| POST | `/parse` | распарсить загруженный PDF в структуру |
| POST | `/import` | подтвердить импорт распарсенных данных в профиль |

### Portfolio — `/v1/portfolio` (публично)
| Метод | Путь | Описание |
|---|---|---|
| GET | `/{username}` | публичный профиль пользователя |

### GitHub — `/v1/github` (требует авторизации)
| Метод | Путь | Описание |
|---|---|---|
| GET | `/fetch` | получить данные из GitHub API |
| POST | `/import` | импортировать выбранное в профиль |

### AI — `/v1/ai` (требует авторизации)
| Метод | Путь | Описание |
|---|---|---|
| GET | `/quota` | остаток дневного лимита |
| POST | `/chat/stream` | стриминг-чат (SSE) |
| POST | `/generate/summary` | сгенерировать summary профиля |
| POST | `/generate/project-description` | сгенерировать описание проекта |
| POST | `/parse-resume` | распарсить резюме через LLM |
| POST | `/feedback` | фидбэк по качеству ответа |

### Billing — `/v1/billing` (требует авторизации, кроме вебхука)
| Метод | Путь | Описание |
|---|---|---|
| POST | `/checkout` | создать Stripe Checkout Session |
| POST | `/webhook` | приём событий Stripe (проверка подписи) |

> В коде `BillingController` сейчас размечен как `@RequestMapping("/api/v1/billing")`, а не `/v1/billing`, как остальные контроллеры (учитывая `context-path: /api`, это даст фактический путь `/api/api/v1/billing`) — см. [известные проблемы](#известные-проблемы).

## Безопасность

- Пароли — bcrypt, cost factor 12.
- JWT — HMAC-подписанные, access (24 часа) + refresh (30 дней), оба несут `userId`, `deviceId`, `role`.
- Refresh-токены хранятся в Redis с TTL, ключ включает `userId` и `deviceId` — логаут гасит одну сессию, не все сразу.
- Проверка владения ресурсом — на уровне сервиса: userId берётся из токена, а не из тела запроса, доступ к чужим `Experience`/`Education`/... сущностям возвращает `403`.
- Чувствительные строковые поля (GitHub-токен в `Profile`) — шифруются в БД отдельным JPA-конвертером.
- CORS — управляется через `cors.allowed-origins`, credentials разрешены только для явно перечисленных источников.
- Секреты — только через переменные окружения в `application-prod.yml`, в коде нет ни одного хардкод-ключа для прода.
- Ошибки — `GlobalExceptionHandler` не пропускает наружу стектрейсы или внутренние сообщения, всё, что не покрыто доменным исключением, превращается в generic `"Internal server error"`.
- Stripe webhook — валидируется по подписи (`Webhook.constructEvent`) до обработки.
- AI-эндпоинты — rate limit по userId и плану (FREE/PRO), а не по IP, чтобы не давать доступ к ресурсу дороже, чем оплачено.

## Переменные окружения

### Backend (`prod`)
```
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
REDIS_HOST
REDIS_PORT
REDIS_PASSWORD
JWT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
GROQ_API_KEY
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
CORS_ALLOWED_ORIGINS
```

### Backend (`dev`, значения — плейсхолдеры/тестовые)
Локально поднимаются Postgres и Redis на `localhost`, ключи Stripe/Groq/OAuth — тестовые или заглушки.

### Frontend
На данный момент `baseURL` в `axios.ts` захардкожен на `http://localhost:8080/api/v1` — перед деплоем нужно вынести в `VITE_API_URL` (или аналог) и переключать по окружению.

## Локальный запуск

### Backend
```bash
# нужны локально поднятые PostgreSQL и Redis
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
Flyway применит миграции автоматически при старте. Дефолтный профиль — `dev` (см. `SPRING_PROFILES_ACTIVE`).

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Открыть `http://localhost:5173`.

## Тестирование

Backend — JUnit, покрыты сервисы `auth`, `profile`, `portfolio`, `billing`, `github`, `resume` (PDF-генерация), `ai` (Groq-клиент, анализ, оценка), а также `JwtService` и `JwtFilter` отдельно.

```bash
cd backend
./mvnw test
```

Frontend — тесты стора авторизации (`entities/user/model/store.test.ts`), проверяют, что access-токен не улетает в `localStorage`, а refresh — сохраняется и корректно чистится при логауте.

```bash
cd frontend
npm run test
```

## Деплой

- Backend — Fly.io.
- Frontend — Vercel.
- CI/CD — пока не описан в этом срезе кода (нет `.github/workflows` в переданных архивах).

## Монетизация

- **FREE** — базовый функционал, 10 AI-запросов в сутки.
- **PRO** — расширенные лимиты (100 AI-запросов в сутки), апгрейд через Stripe Checkout.
- Оплата — Stripe (глобально), в перспективе — Kaspi Pay для СНГ-аудитории.

## Известные проблемы

- `User.githubAccessToken` хранится в БД без шифрования, в отличие от `Profile.githubToken`, который зашифрован — нужно привести к одному стандарту.
- `StringCryptoConverter` использует `AES/ECB` — стоит перейти на `AES/GCM` со случайным IV на запись.
- Refresh-токен на фронте лежит в `localStorage`, а не в httpOnly cookie — при XSS даёт долгоживущий доступ к сессии.
- `BillingController` размечен как `/api/v1/billing`, тогда как остальные контроллеры — `/v1/...` (при активном `context-path: /api` это, вероятно, лишний уровень пути) — стоит перепроверить фактическое поведение и привести к одному стилю.
- `baseURL` API на фронте захардкожен на `localhost` — до деплоя вынести в переменную окружения.
- `AiRateLimiter` хранит бакеты в памяти процесса — при нескольких инстансах backend перестанет быть общим лимитом на пользователя, нужен переход на Redis-backed `Bucket4j`.
- Обработка повторной доставки Stripe-вебхука (`checkout.session.completed`) не идемпотентна явно — сейчас это не страшно (повторный апгрейд FREE→PRO безобиден), но станет важным при появлении событий с денежными эффектами.

## Roadmap

- Полноценный админ-панель.
- Экспорт резюме в дополнительные форматы.
- Больше шаблонов резюме и портфолио.
- Kaspi Pay для СНГ-региона.
- Redis-backed rate limiting для AI при масштабировании на несколько инстансов.
- 2FA.
- Мониторинг (метрики, алерты).
