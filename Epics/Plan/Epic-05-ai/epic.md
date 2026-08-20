# Epic-05-ai: AI Engine

## Мета

| Поле | Значение |
|---|---|
| **Домен** | AI |
| **Роли** | USER (FREE/PRO), ADMIN |
| **Статус** | Done |
| **Миграции** | V12, V13, V18 |
| **Зависит от** | Epic-01, Epic-02, Epic-04 |
| **Блокирует** | Epic-06, Epic-07 |

---

## Зачем этот эпик

AI — дифференцирующая фича: авто-генерация summary, описаний, полного профиля, парсинг PDF, матчинг вакансий, RAG cover-letter. Без этого эпика MeDev — ручной редактор.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-05.1 | USER | общаться с AI-ассистентом в стриме (SSE) | быстро итерировать текст | Done |
| US-05.2 | USER | сгенерировать summary одной кнопкой | не писать с нуля | Done |
| US-05.3 | USER | сгенерировать описание проекта | описать техническую сложность | Done |
| US-05.4 | USER | загрузить PDF и смержить с GitHub (Smart Merge) | не потерять данные, не получить галлюцинации | Done |
| US-05.5 | USER | сгенерировать полный профиль из GitHub snapshot | профиль на 95% автоматически | Done |
| US-05.6 | USER | видеть остаток дневной квоты | планировать использование | Done |
| US-05.7 | PRO | сгенерировать cover-letter и tailor под вакансию (RAG) | откликаться точечно | Done |
| US-05.8 | USER | получить match-score и feedback | оценить соответствие | Done |
| US-05.9 | USER | оценить AI-генерацию (thumbs + заметки) | улучшить промпты | Done |

---

## Out of Scope

- Локальная модель — нет
- Fine-tuning — нет

---

## Технические решения

- **`LlmProvider` interface + `GroqClient`** — единственный провайдер (llama-3.1-70b-versatile), подменяемый.
- **Streaming (SSE) + Structured (JSON mode)** — два режима; JSON с валидацией.
- **Resilience4j CircuitBreaker + Retry** — retry (4, backoff 4-20с) только для retriable (429, 5xx).
- **`AiRateLimiter` (Redis, FREE=10/день, PRO=100/день)** — квоты с TTL 24ч, кэш плана 15 мин.
- **`TokenAccountingService` (async)** — `ai_usage` без блокировки.
- **Smart Merge** — GitHub = правда для языков/проектов; PDF — для дат/компаний. Нет данных → null (без галлюцинации).
- **`PiiMasker`** — маскирование PII (Sprint 5).
- **JSON-cleaning** — снимает ` ```json `; невалидный → RuntimeException 'Aborting to prevent data loss'.
- **`VectorizationService` (event-driven, async)** — pgvector (384, HNSW, cosine) для RAG.
- **Prompt injection** — `sanitize()` обрезает input до 2000 (только chat).

---

## Acceptance Criteria

- [x] [US-05.1] `POST /v1/ai/chat/stream` (text/event-stream) с rate-limit и structured errors
- [x] [US-05.2] `POST /v1/ai/generate/summary`
- [x] [US-05.3] `POST /v1/ai/generate/project-description`
- [x] [US-05.4] `POST /v1/ai/parse-resume` (multipart) → ProfileDto через Smart Merge
- [x] [US-05.5] `POST /v1/ai/generate-profile` из GithubSnapshot
- [x] [US-05.6] `GET /v1/ai/quota`
- [x] [US-05.7] `/cover-letter`, `/tailor` требуют `assertPro` (403 FREE)
- [x] [US-05.8] `/match-job` → {score, feedback}
- [x] [US-05.9] `POST /v1/ai/feedback` сохраняет AiEvaluation

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

- [WARNING] `max_tokens=2048` фиксирован — длинные генерации могут обрезаться.
- [WARNING] `POST /v1/ai/match-job` НЕ вызывает `assertPro` — FREE может матчить. PRO-gate непоследователен.
- [INFO] `sanitize()` только для chat; structured передают jobDescription без лимита.
- [INFO] JSON-cleaning дублируется в `GroqClient` и `AiAnalysisService`.
- [INFO] `structuredCompletion` использует `.block()` — упрётся в thread pool.
- [INFO] `VectorizationService` удаляет и пере-добавляет все векторы на каждое обновление профиля.

---

## Связанные ресурсы

- Миграции: `V12__create_ai_usage.sql`, `V13__create_ai_evaluations.sql`, `V18__add_vector_embeddings.sql`
- Контроллер: `modules/ai/controller/AiController.java`
- Сервисы: `GroqClient.java`, `AiAnalysisService.java`, `AiAssistantService.java`, `AiApplicationService.java`, `AiContextService.java`, `AiGenerateService.java`, `AiOnboardingService.java`, `AiRateLimiter.java`, `TokenAccountingService.java`, `VectorizationService.java`, `EvaluationService.java`, `WebScraperService.java`
- Промпты: `backend/src/main/resources/prompts/` (7 файлов)
- Тесты: `backend/src/test/java/com/medev/modules/ai/`
- Frontend: `frontend/src/features/ai/`, `features/ai-assistant/`
