# MeDev — Полный анализ, теория и Roadmap развития

> Дата: 2026-08-11  
> Автор анализа: независимый engineering review  
> Цель документа: дать чёткий вектор превращения MeDev из «хорошего MVP с AI» в production-ready LLM-продукт уровня middle/senior LLM-инженера.

---

## 1. Executive Summary

MeDev — data-first SaaS-платформа для разработчиков: единый профиль → публичное портфолио + генератор ATS-friendly PDF-резюме + AI-ассистент.

**Текущий статус:**  
MVP завершён. Есть OAuth2 (GitHub), парсинг репозиториев, drag-and-drop конструктор, PDF-генерация (Thymeleaf + Flying Saucer/PDFBox), базовая интеграция Groq через SSE, модульный монолит на Spring Boot 3 + React 19 + FSD.

**Главный вывод:**  
MeDev — самый перспективный проект в портфолио для позиционирования как LLM-разработчик. Архитектура AI сделана правильно (ключ только на бэке, SSE, контекст пользователя). Но сейчас AI «подключён», а не «спроектирован». Нет rate-limit в проде, нет structured output, нет evaluation loop, нет cost control, нет fallback-логики.

**Вектор:**  
Сделать MeDev эталонным примером LLM-продукта в соло-разработке: от простого chat → к tool-calling, structured generation, evaluation, observability и монетизации AI-фич.

---

## 2. Текущее состояние (детальный аудит)

### 2.1 Архитектура

Backend — Modular Monolith:

- domains: `auth`, `profile`, `github`, `ai`, `portfolio`, `resume`, `billing`
- Java 17 + Spring Boot 3.3
- PostgreSQL + Flyway
- Redis (JWT refresh tokens)
- GroqClient (WebClient + SSE)
- PDF: Thymeleaf + Flying Saucer / PDFBox

Frontend:

- React 19 + TypeScript + Vite
- Feature-Sliced Design (частично)
- Zustand + React Query
- dnd-kit
- Tailwind CSS v4
- SSE для AI-стриминга

### 2.2 Что уже работает хорошо

1. **Security proxy pattern**  
   GROQ_API_KEY никогда не попадает на фронт. Все вызовы идут через бэкенд. Это правильно и соответствует production-ready критериям.

2. **SSE вместо WebSocket для чата**  
   Правильный выбор. Full-duplex не нужен. SseEmitter проще и легче.

3. **Контекст пользователя**  
   В документации уже описан `AiContextService`, который собирает profile + GitHub данные в system prompt. Это фундамент для полезного AI.

4. **Модульность**  
   Домены разделены. Это позволяет развивать AI-модуль независимо.

5. **Документация**  
   Есть `MEDEV_AI_INTEGRATION.md`, `DEVELOPMENT_VECTOR.md`, `MEDEV_ROADMAP.md`, lifecycle-документы. Уровень дисциплины выше среднего для соло-MVP.

### 2.3 Критические проблемы (по приоритету)

#### [CRITICAL] Нет production-grade AI resilience

- GroqClient: синхронный / без timeout / без retry / без circuit breaker
- Нет fallback при 503/429 от Groq
- Нет graceful degradation («AI временно недоступен, заполните вручную»)
- Нет structured output (JSON mode / tool calling)
- Нет валидации ответа LLM перед использованием

#### [CRITICAL] Нет rate limiting на AI

Free tier Groq имеет жёсткие лимиты. Один активный пользователь может сжечь квоту.  
Bucket4j уже используется в JF-1C — паттерн нужно перенести.

#### [CRITICAL] ProfileService God Object (472 строки)

Один сервис отвечает за CRUD 6 сущностей + маппинг + GitHub import. Нарушает SRP. Мешает безопасному добавлению billing и AI-фич.

#### [CRITICAL] 0% тестов

Нет unit, нет integration, нет TestContainers.  
CI/CD отсутствует или минимален.

#### [WARNING] Нет evaluation loop

Невозможно измерить качество генераций. Нет golden dataset, нет LLM-as-judge, нет human feedback loop.

#### [WARNING] Cost control отсутствует

Нет учёта токенов на пользователя / на запрос. Невозможно посчитать unit economics AI-фич.

#### [WARNING] Frontend

- Нет code splitting (lazy routes)
- Axios interceptor не делает automatic refresh + retry
- i18n покрывает только часть UI
- FSD внедрён частично

#### [WARNING] Observability

Нет structured logging с MDC (userId, requestId, tokens used).  
Нет метрик (количество AI-вызовов, latency, error rate, token usage).

### 2.4 Сильные стороны, которые нужно сохранить

- Data-first подход (один профиль → много выходов)
- Drag-and-drop конструктор
- ATS-friendly PDF
- GitHub OAuth + parsing
- Чёткое разделение Free/Pro в дизайне продукта

---

## 3. Теория: как проектировать LLM-продукт правильно

### 3.1 Уровни зрелости LLM-интеграции

| Уровень | Название              | Что есть                          | Что отсутствует                  |
|---------|-----------------------|-----------------------------------|----------------------------------|
| 0       | Chat wrapper          | Просто вызов LLM                  | Контекст, guardrails             |
| 1       | Contextual assistant  | System prompt + user data         | Structured output, tools         |
| 2       | Tool-using agent      | Function calling / tools          | Evaluation, observability        |
| 3       | Evaluated product     | Golden set, LLM-as-judge, metrics | Cost control, A/B                |
| 4       | Production LLM system | Full observability + fallbacks    | —                                |

**MeDev сейчас находится между уровнем 0 и 1.**  
Цель roadmap — уверенно выйти на уровень 3, с элементами 4.

### 3.2 Ключевые принципы production LLM

1. **Never trust the model**  
   Всегда валидируй output. Structured output + schema validation обязательны.

2. **Determinism where possible**  
   Temperature 0–0.3 для генерации резюме/summary. Higher temperature только для brainstorm.

3. **Cost is a first-class citizen**  
   Каждый вызов стоит денег. Нужен token accounting и hard limits.

4. **Latency budget**  
   Пользователь терпит 2–4 секунды на генерацию. Дальше — плохой UX. Streaming помогает, но не спасает от плохих промптов.

5. **Fallback is mandatory**  
   LLM может упасть, вернуть мусор, превысить квоту. Продукт должен продолжать работать.

6. **Evaluation before scale**  
   Без golden dataset и метрик невозможно улучшать качество системно.

### 3.3 Structured Output

Два основных подхода:

**A. JSON Mode (простой)**  
```
response_format: { "type": "json_object" }
```
+ жёсткий system prompt: "Return ONLY valid JSON matching this schema: {...}"

**B. Tool Calling / Function Calling (предпочтительный)**  
Определяешь tool с JSON Schema. Модель обязана вызвать tool с правильными аргументами.

Для MeDev рекомендуется начать с JSON Mode + schema validation, потом перейти на tool calling для более сложных сценариев (generate summary + projects + skills за один вызов).

### 3.4 Evaluation Loop (теория)

Без evaluation любой AI-продукт деградирует.

Минимальный набор:

1. **Golden Dataset**  
   30–50 реальных (анонимизированных) профилей + эталонные хорошие summary / project descriptions.

2. **Automatic Metrics**  
   - Format validity (JSON schema)
   - Length constraints
   - Keyword coverage (стек, ключевые слова)
   - LLM-as-judge (отдельный вызов с rubric)

3. **Human Feedback**  
   Кнопка «это полезно / не полезно» + опциональный комментарий.

4. **Regression testing**  
   Перед каждым изменением system prompt прогонять golden set.

### 3.5 Rate Limiting & Cost Control

Два уровня:

- **Application level (Bucket4j / Redis)**  
  Free: 10 AI-запросов / день  
  Pro: 100 AI-запросов / день  
  + soft limit (например 50k tokens / день)

- **Provider level**  
  Обработка 429 от Groq с exponential backoff + circuit breaker.

Token accounting:

```java
record AiUsage(Long userId, String model, int promptTokens, int completionTokens, Instant timestamp)
```

Хранить в PostgreSQL или Redis + периодический flush.

### 3.6 Prompt Engineering для резюме

Хороший system prompt для MeDev должен содержать:

- Роль («ты senior technical recruiter + copywriter»)
- Жёсткие constraints (длина, тон, запрет на выдумки)
- Структуру вывода
- Примеры (few-shot) хороших и плохих summary
- Инструкцию «если данных недостаточно — скажи об этом прямо»

Пример структуры:

```
You are an expert technical resume writer.
Your only job is to improve the user's professional profile based on real data provided below.
Rules:
1. Never invent experience, companies or metrics that are not present in the data.
2. Keep language professional, concise, action-oriented.
3. Prefer quantifiable achievements when data allows.
4. Output language must match the request (ru / en).
5. Return ONLY the requested field, no explanations.
```

### 3.7 Observability для LLM

Обязательные метрики:

- `ai_requests_total` (by endpoint, plan, status)
- `ai_tokens_total` (prompt + completion)
- `ai_latency_seconds` (histogram)
- `ai_errors_total` (by type: timeout, 429, parse_error, validation_error)
- `ai_cost_usd_estimated`

Логи:

- request_id
- user_id
- model
- prompt_tokens / completion_tokens
- latency
- success / error reason
- (опционально) truncated prompt hash

---

## 4. Полный список улучшений (backlog)

### 4.1 Backend — AI Module

#### 4.1.1 Resilience

- [ ] Добавить timeout (connect 10s, read 45s) в WebClient
- [ ] Retry с exponential backoff (3 попытки: 1s, 2s, 4s) только на 429/5xx
- [ ] Circuit breaker (Resilience4j) — открывать после 5 ошибок подряд
- [ ] Fallback response: структурированный JSON с флагом `"ai_unavailable": true`
- [ ] Валидация конфига при старте: если GROQ_API_KEY пустой — AI-фичи disabled + warning

#### 4.1.2 Structured Output

- [ ] Ввести JSON Schema для каждого типа генерации (summary, project_description, experience_bullet, full_profile_analysis)
- [ ] Использовать `response_format: { "type": "json_object" }`
- [ ] Post-validation через Jackson + custom validators
- [ ] При невалидном JSON — 1 retry с ужесточённым промптом, потом fallback

#### 4.1.3 Context & Prompt

- [ ] Реализовать `AiContextService` полностью (profile + GitHub + plan)
- [ ] Кэшировать GitHub-данные в Redis (TTL 1 час)
- [ ] Обрезать длинные описания (max ~1800–2000 токенов system prompt)
- [ ] Поддержка языка запроса (ru/en)
- [ ] Few-shot примеры в system prompt

#### 4.1.4 Rate Limiting & Usage

- [ ] Bucket4j на `/api/v1/ai/**`
  - Free: 10 req/day
  - Pro: 100 req/day
- [ ] Token accounting (сохранять usage)
- [ ] Endpoint для пользователя: «сколько запросов осталось сегодня»
- [ ] Hard limit на токены в одном запросе (защита от огромных PDF)

#### 4.1.5 Evaluation Infrastructure

- [ ] Таблица `ai_evaluations` (request_id, user_feedback, judge_score, notes)
- [ ] Endpoint для human feedback («полезно / не полезно»)
- [ ] Простой LLM-as-judge сервис (отдельный prompt + rubric)
- [ ] Golden dataset (30+ примеров) в `src/test/resources/golden/`
- [ ] Скрипт / тест, который прогоняет golden set и пишет отчёт

#### 4.1.6 Tools / Function Calling (следующий этап)

- [ ] Tool `generate_summary`
- [ ] Tool `improve_project_description`
- [ ] Tool `analyze_github_profile`
- [ ] Tool `suggest_skills_from_repos`
- [ ] Оркестратор, который может вызывать несколько tools за один user request

### 4.2 Backend — Core & Architecture

- [ ] Разбить `ProfileService` на отдельные сервисы (Experience, Education, Skill, Language, Project, Profile)
- [ ] Внедрить MapStruct
- [ ] GlobalExceptionHandler: добавить обработку validation, MaxUploadSize, AI-specific errors
- [ ] File size limit 10MB на PDF upload
- [ ] Strict CORS для production
- [ ] Structured logging (JSON + MDC: userId, requestId)
- [ ] Health checks + readiness (включая проверку Redis и PostgreSQL)

### 4.3 Testing & CI/CD

- [ ] Unit tests: AuthService, JwtService, AiContextService, GroqClient (mocked)
- [ ] Integration tests с TestContainers (PostgreSQL + Redis)
- [ ] GitHub Actions:
  - backend: `./gradlew build test`
  - frontend: `npm ci && npm run lint && npm run build`
  - blocking on failure
- [ ] Coverage report (хотя бы 40–50% на критические модули)

### 4.4 Frontend

- [ ] Code splitting (React.lazy + Suspense) по роутам
- [ ] Axios interceptor: automatic token refresh + request queue
- [ ] Полный i18n (ru + en)
- [ ] Кнопки «Generate with AI» в секциях профиля (summary, projects, experience)
- [ ] AiFeedbackPanel на странице resume (Pro only)
- [ ] Показывать remaining AI quota
- [ ] Skeleton / streaming UI improvements
- [ ] Error boundaries вокруг AI-компонентов

### 4.5 Product & Monetization

- [ ] Чёткое разделение Free / Pro на уровне фич AI
- [ ] Stripe Checkout + Webhooks (уже заложено)
- [ ] Kaspi Pay (для СНГ) — future
- [ ] Usage dashboard для пользователя
- [ ] Soft upsell: «вы достигли лимита Free, перейти на Pro?»

### 4.6 Observability & Ops

- [ ] Micrometer metrics для AI
- [ ] Логирование token usage
- [ ] Alerting (например Telegram) при высоком error rate или превышении cost
- [ ] Dockerfile + fly.toml для backend
- [ ] Backup strategy для PostgreSQL

---

## 5. Рекомендуемый Roadmap (по фазам)

### Фаза 0 — Стабилизация фундамента (1–1.5 недели)

Цель: сделать так, чтобы можно было безопасно развивать AI.

1. Разбить ProfileService + MapStruct
2. Написать минимальные unit-тесты (Auth + Jwt + базовый Profile)
3. CI/CD pipeline
4. File size limit + validation exception handling
5. Code splitting на фронте
6. Axios refresh interceptor

**Exit criteria:**  
CI зелёный, ProfileService больше не god-object, фронт не грузит всё сразу.

### Фаза 1 — Production-ready AI Core (1.5–2 недели)

Цель: превратить «подключённый Groq» в надёжный AI-модуль.

1. Полный `AiContextService` + кэш GitHub
2. Timeout + retry + circuit breaker + fallback в GroqClient
3. Structured output (JSON mode) + validation
4. Rate limiting (Bucket4j) + token accounting
5. Human feedback endpoint
6. Обновить system prompts (constraints + few-shot)

**Exit criteria:**  
AI не падает при проблемах Groq, есть лимиты, ответы валидируются, usage считается.

### Фаза 2 — Полезные AI-сценарии (1–2 недели)

Цель: сделать AI реально полезным в продукте.

1. Generate with AI в редакторе (summary, project descriptions, bullets)
2. Analyze Resume (Pro)
3. Analyze GitHub Profile
4. Показ remaining quota
5. Улучшение UX стриминга

**Exit criteria:**  
Пользователь может одним кликом улучшить ключевые секции резюме и получить анализ.

### Фаза 3 — Evaluation & Quality Loop (1 неделя)

Цель: научиться измерять и улучшать качество.

1. Golden dataset
2. LLM-as-judge
3. Автоматический прогон + отчёт
4. Простая панель feedback

**Exit criteria:**  
Можно измерить, стало ли лучше после изменения промпта.

### Фаза 4 — Monetization & Scale (1–2 недели)

1. Stripe (Free → Pro)
2. Жёсткое разграничение AI-фич
3. Usage dashboard
4. Soft upsell flows
5. Production deploy + monitoring

**Exit criteria:**  
Можно принимать платежи и контролировать стоимость AI.

### Фаза 5 — Advanced LLM (future consideration)

- Tool calling / multi-step agent
- Multi-provider fallback (OpenRouter / другой провайдер)
- A/B тестирование промптов
- RAG по лучшим резюме (осторожно с privacy)
- Экспорт улучшенного README.md для GitHub

---

## 6. Конкретные технические рекомендации

### 6.1 GroqClient (целевая форма)

```java
@Service
public class GroqClient {

    private final WebClient webClient;
    private final CircuitBreaker circuitBreaker;
    private final Retry retry;

    public Mono<String> streamCompletion(String systemPrompt, String userMessage) {
        // timeout + retry + circuit breaker
        // SSE parsing
        // token counting side-effect
    }

    public Mono<JsonNode> structuredCompletion(String systemPrompt, String userMessage, Class<?> schema) {
        // JSON mode
        // validation
        // fallback
    }
}
```

### 6.2 Rate Limit Keys

```
ai:daily:{userId}          → 10 / 100
ai:tokens:daily:{userId}   → soft limit
ai:ip:{ip}                 → защита от анонимного спама
```

### 6.3 System Prompt Template (skeleton)

```
You are MeDev AI — an expert technical resume and portfolio assistant.
You know the following about the user:
=== PROFILE ===
{profile_block}

=== GITHUB ===
{github_block}

Rules:
- Never invent facts
- Be concise and specific
- Match the language of the user message
- If data is insufficient, say so clearly
- Output must be valid according to the requested format
```

### 6.4 Golden Dataset Structure

```
golden/
  case_001/
    input_profile.json
    input_github.json
    expected_summary.txt
    expected_project_desc.txt
    notes.md
  case_002/
    ...
```

---

## 7. Риски и как их митигировать

| Риск                              | Вероятность | Impact | Митигация                                      |
|-----------------------------------|-------------|--------|------------------------------------------------|
| Сжигание Groq quota               | Высокая     | Высокий| Rate limit + token accounting + circuit breaker|
| Галлюцинации в резюме             | Средняя     | Высокий| Structured output + «never invent» + validation|
| ProfileService станет ещё больше  | Высокая     | Средний| Немедленный распил                             |
| Нет пользователей → нет feedback  | Высокая     | Средний| Сначала сделать полезным для себя + друзей     |
| Over-engineering AI               | Средняя     | Средний| Сначала простые сценарии, потом tools          |
| Cost > revenue                    | Средняя     | Высокий| Жёсткие лимиты Free + мониторинг стоимости     |

---

## 8. Метрики успеха (что считать прогрессом)

### Технические

- AI error rate < 2%
- p95 latency AI < 4s (со streaming)
- 100% AI-ответов проходят schema validation
- Test coverage критических модулей > 50%
- CI всегда зелёный

### Продуктовые

- % пользователей, которые нажали «Generate with AI» хотя бы раз
- % пользователей, которые оставили positive feedback
- Conversion Free → Pro (после введения AI-лимитов)
- Среднее количество AI-запросов на активного пользователя

### Качество

- LLM-as-judge score на golden set растёт после изменений промпта
- Снижение ручных правок после AI-генерации

---

## 9. Что НЕ делать сейчас (future consideration)

- Мульти-модельность / fallback на другой провайдер (пока рано)
- Полноценный multi-agent
- RAG по чужим резюме (privacy + complexity)
- Real-time collaborative editing
- Mobile app
- Сложный A/B framework до появления статистики

Эти вещи помечать как `future consideration` и не трогать, пока не закрыты Фазы 0–3.

---

## 10. Личный вектор для тебя как разработчика

MeDev — лучший полигон, чтобы вырасти именно как LLM-инженер, а не просто «full-stack с подключённым GPT».

Что ты получишь, если доведёшь roadmap:

1. Опыт проектирования production LLM-системы (не toy chat)
2. Понимание cost, latency, evaluation, fallback
3. Портфолио-кейс: «я спроектировал и довёл до production AI-модуль в SaaS»
4. Возможность говорить на собеседованиях не «подключал API», а «строил evaluation loop, rate limiting, structured generation и observability»

JF-1C остаётся доказательством, что ты умеешь большие системы и security.  
MeDev становится доказательством, что ты умеешь LLM-продукты.

---

## 11. Приоритетный чеклист на ближайшие 14 дней

**Неделя 1**
- [ ] Распил ProfileService + MapStruct
- [ ] Минимальные тесты + CI
- [ ] Timeout/retry/fallback в GroqClient
- [ ] Rate limiting на AI
- [ ] AiContextService + кэш

**Неделя 2**
- [ ] Structured output + validation
- [ ] Generate with AI кнопки в редакторе
- [ ] Token accounting
- [ ] Human feedback
- [ ] Базовый golden set (хотя бы 10 кейсов)

После этих двух недель MeDev уже будет выглядеть как серьёзный LLM-продукт, а не как MVP с чатом.

---

## 12. Заключение

MeDev имеет правильный фундамент и правильную идею.  
Сейчас главный риск — остановиться на «AI подключён» и распылиться на другие проекты.

Рекомендация однозначная:

1. Заморозить развитие Envie и AirCanvas.
2. JF-1C оставить в режиме поддержки.
3. Все свободные инженерные часы направить в MeDev по roadmap выше.

Если сделать это дисциплинированно, через 4–6 недель у тебя будет один из самых сильных соло LLM-кейсов на рынке СНГ уровня middle+.

---

## Приложение A. Полезные ссылки и паттерны

- Groq OpenAI-compatible API
- Resilience4j (CircuitBreaker + Retry)
- Bucket4j + Redis
- MapStruct
- TestContainers
- Micrometer + Prometheus
- LLM-as-a-Judge patterns (OpenAI cookbook / LangSmith / RAGAS идеи)
- Structured Outputs best practices

## Приложение B. Шаблон Issue / Epic

```
Title: [AI] Implement structured output + validation for summary generation
Type: Feature
Priority: High
Acceptance Criteria:
- [ ] JSON mode enabled
- [ ] Schema validation passes on 95%+ of golden cases
- [ ] Fallback on invalid JSON
- [ ] Token usage recorded
- [ ] Unit tests
```

## Приложение C. Пример rubric для LLM-as-judge

```
Оцени сгенерированный summary по шкале 1–5:
1. Фактическая точность (не выдумывает)
2. Конкретность (есть стек, достижения, а не вода)
3. Длина и читаемость
4. Профессиональный тон
5. Соответствие данным профиля

Итоговый score = среднее. Комментарий обязателен.
```

---

*Конец документа.*

> Этот файл можно класть прямо в репозиторий MeDev как `docs/MEDEV_FULL_ANALYSIS_AND_ROADMAP.md`  
> и использовать как единый источник правды для следующих спринтов.
