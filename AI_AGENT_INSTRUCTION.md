# AI Agent Instruction — MeDev

Этот файл — единый источник правды для AI-агентов (Claude Code, Cursor, Codex и др.).
Читай его целиком перед любым действием в репозитории.

> Также см. `/CLAUDE.md` и `/.agents/AGENTS.md` — дополнения по поведению и контексту.

---

## 1. Что такое MeDev

Data-first SaaS для разработчиков. Берёт активность GitHub + резюме PDF, через AI (Groq, llama-3.1-70b-versatile) строит профиль, генерирует ATS-friendly PDF резюме и публичное веб-портфолио. Есть Job Tracker (с AI-матчингом), биллинг (Stripe + Kaspi Pay mock), квоты, админ-панель с аудит-логами.

Production-Ready MVP. Все фазы roadmap (1–8) реализованы, бэклог аудитов закрыт.

---

## 2. Стек

### Backend
| Компонент | Версия / Детали |
|---|---|
| Java | 17 |
| Spring Boot | 3.3.0 |
| DB | PostgreSQL (Flyway, V1–V23) + pgvector |
| Cache | Redis (refresh tokens, rate limits, AI-квоты, кэш) |
| Auth | JWT (access 15 мин + refresh 30 дней в Redis) + OAuth2 (GitHub, Google) |
| Resilience | Resilience4j (CircuitBreaker + Retry), Bucket4j (rate limit) |
| AI | Groq API (прокси-бэкенд, SSE-стриминг) |
| PDF | Thymeleaf + Flying Saucer + PDFBox |
| Payments | Stripe, Kaspi Pay (mock) |
| Vector | Spring AI pgvector (384 dim, HNSW, cosine) |
| Tests | JUnit 5 + Testcontainers (PostgreSQL, Redis) |

### Frontend
| Компонент | Версия / Детали |
|---|---|
| React | 19 |
| TypeScript | latest |
| Build | Vite |
| Deploy | GitHub Pages |
| Стилизация | Tailwind CSS v4 (строгий GitHub Dark Mode) |
| Архитектура | FSD (shared → entities → features → widgets → pages → app) |
| State | Zustand (global, persist) + React Query (server) |
| i18n | react-i18next (RU/EN) |
| Routing | react-router-dom v7 (lazy + Suspense) |
| Tests | vitest + @testing-library/react |

### Инфраструктура
- Хостинг: Fly.io (backend), GitHub Pages (frontend)
- CI/CD: GitHub Actions (`ci.yml`, `deploy.yml`)
- Branch protection: require PR + status checks

---

## 3. Архитектура

```
backend/src/main/java/com/medev/
└── modules/
    ├── auth/          # JWT, OAuth2, refresh tokens, rate-limiting
    ├── profile/       # CRUD experience/education/skills/languages/projects + Smart Merge
    ├── github/        # Импорт репо, языков, README tech-stack, GraphQL, snapshots
    ├── ai/            # GroqClient, streaming, structured (JSON), RAG, rate limits, token accounting
    ├── portfolio/     # Публичная страница по username
    ├── resume/        # PDF/HTML генерация (5 шаблонов), квоты
    ├── tracker/       # Job applications CRUD + JD scraping + AI matching
    ├── billing/       # Stripe, Kaspi Pay, assertPro gate
    ├── admin/         # Управление юзерами, ролями, планами
    └── audit/         # Audit logs (готов, но не wired)
```

**141 Java-класс, 9 модулей.**

Детально: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

### API
- Context path: `/api`
- Версионирование: `/api/v1/...`
- Frontend `VITE_API_URL` = origin + `/api/v1`

### Роли
`USER` | `ADMIN`

### Security
- JWT (access 15 мин + refresh 30 дней в Redis), type segregation
- OAuth2 (GitHub, Google) с code-exchange через Redis
- AES-256-GCM для `github_access_token`
- IDOR protection через `SecurityUtils.getCurrentUserId()` + ownership-проверки
- Rate limiting: Bucket4j + Redis
- SSRF protection в WebScraper (whitelist хостов)

---

## 4. База данных

### Правила (обязательно)
- Схема **только** через Flyway. `ddl-auto=validate`.
- Файлы: `src/main/resources/db/migration/V{N}__{description}.sql`
- Два подчёркивания между версией и описанием — обязательно.
- Текущая последняя миграция: **V23** (23 скрипта).

### Никогда
- Не изменяй существующие миграции (V1–V23) — ломает чексуммы и деплой.
- Не запускай `DROP`, `DELETE` на всю таблицу без подтверждения владельца.
- `flywayClean` — только на локальной тестовой БД, **никогда** на staging/production.

---

## 5. Структура планирования (эпики)

```
Epics/Plan/
  Epic-{N}-{slug}/
    epic.md              ← Мета, Зачем, User Stories, Out of Scope, Тех. решения,
                            Acceptance Criteria, Definition of Done, Техдолг, Ресурсы
```

### Формат epic.md (стандартизованный)
```markdown
# Epic-{N}: {Название}

## Мета
| Поле | Значение |
| Домен | ... | Роли | ... | Статус | Done/In Progress/Partial/Planned |
| Миграции | V{от} — V{до} | Зависит от | ... | Блокирует | ... |

## Зачем этот эпик
...

## Пользовательские истории
| ID | Роль | Хочу | Чтобы | Статус |

## Out of Scope
## Технические решения
## Acceptance Criteria
## Definition of Done
## Известные ограничения / технический долг
## Связанные ресурсы
```

### Коммиты
```
feat(US-N.M): краткое описание
fix(US-N.M): краткое описание
migration(VN): краткое описание
docs: краткое описание
```

### Текущие эпики
| # | Slug | Домен | Статус |
|---|---|---|---|
| 01 | auth | Auth | Done |
| 02 | profile | Profile | Done |
| 03 | portfolio | Portfolio | Done |
| 04 | github | GitHub | Done |
| 05 | ai | AI | Done |
| 06 | resume | Resume | Done |
| 07 | tracker | Tracker | Done |
| 08 | billing | Billing | Partial |
| 09 | admin | Admin | Partial |
| 10 | infra | Infra | Done |
| 11 | observability | Infra | Planned |
| 12 | frontend | Cross | Done |

Детали — в `Epics/Plan/Epic-{N}-{slug}/epic.md`.

---

## 6. Правила для агентов

### Перед написанием кода
1. Найди соответствующий Epic в `Epics/Plan/`.
2. Проверь существующие паттерны в модуле — не изобретай новые.
3. Если нужна миграция — создай `V{N+1}__{description}.sql` **до** изменения entity.

### Приоритеты при конфликтах
**Security > Correctness > Performance > Code Cleanliness**

### Секреты
- Только в env vars / Fly.io secrets. Никогда в source.
- Локальные `.env` не коммитить.

### Тесты
- Deploy pipeline блокируется на упавших backend-тестах (`./gradlew build`).
- Новая фича = новый тест.
- [WARNING] Фронтенд-тесты **не запускаются** в CI — backlog.

### Журнал
- Перед `git push`: обязательна запись в `journal/YYYY-MM-DD/` (правило подкреплено git-хуком `pre-push`).

### Что не трогать
- Существующие Flyway миграции V1–V23.
- `ddl-auto=validate` (всегда).
- Инфраструктуру Fly.io (если не явно запрошено).

---

## 7. Документация

| Документ | Назначение |
|---|---|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Архитектура, модули, безопасность, БД |
| [docs/ONBOARDING.md](./docs/ONBOARDING.md) | Локальный запуск |
| [docs/RUNBOOK.md](./docs/RUNBOOK.md) | Регламент эксплуатации и инцидентов |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Правила контрибьюта |
| [docs/SECURITY_AUDIT.md](./docs/SECURITY_AUDIT.md) | Аудит безопасности |
| [AUDIT_PROJECT_REVIEW.md](./AUDIT_PROJECT_REVIEW.md) | Полный обзор проекта (с нуля до вершин) |
| [MEDEV_ROADMAP.md](./MEDEV_ROADMAP.md) | Roadmap к боевому уровню |
| [README.md](./README.md) | Краткое описание для GitHub |
| [Epics/Plan/](./Epics/Plan/) | Эпики и user stories |
| [.agents/CONTEXT.md](./.agents/CONTEXT.md) | Текущий контекст проекта |

---

## 8. Known Issues (открытые)

| Issue | Статус |
|---|---|
| AuditService не wired в бизнес-потоки | WARNING, backlog |
| Admin dashboard заглушки (proUsers, tokens) | WARNING, backlog |
| `StringCryptoConverter` AES/ECB + дефолтный ключ | WARNING |
| `match-job` без assertPro | WARNING |
| ResumeController инвертированная PRO-проверка | WARNING |
| Kaspi orderId user-controlled | WARNING |
| Фронтенд-тесты вне CI | WARNING, backlog |
| Stripe webhook без idempotency | WARNING |

Детали — в [docs/SECURITY_AUDIT.md](./docs/SECURITY_AUDIT.md).
