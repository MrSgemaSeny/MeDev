# MeDev RAG — Plan A: Оживить embedding pipeline

**Цель:** заменить `MockVectorStoreConfig` на реальный провайдер эмбеддингов,
не добавляя нагрузку на JVM и не меняя ни одну строку в `VectorizationService`
и `AiApplicationService` — они уже написаны правильно.

---

## Диагностика: почему сейчас не работает

| Компонент | Состояние |
|---|---|
| `V18__add_vector_embeddings.sql` | работает — таблица и HNSW-индекс созданы |
| `VectorizationService` | написан правильно, слушает `ProfileUpdatedEvent` |
| `AiApplicationService` | RAG-ретривал написан, `SearchRequest` сформирован |
| `MockVectorStoreConfig` | **заглушка — `add()` ничего не делает, `similaritySearch()` возвращает `[]`** |
| `spring-ai-core` | подключён, но без реального `EmbeddingModel` бин не инициализируется |

**Root cause:** ONNX-модель внутри JVM → OOM на Render 512 MB.
Решение — эмбеддинги считать через внешний HTTP API, Java только отправляет строку и получает `float[]`.

---

## Выбор провайдера эмбеддингов

| Провайдер | Размерность | Цена | Совместимость с `vector(384)` |
|---|---|---|---|
| **Jina AI** `jina-embeddings-v2-base-en` | 768 | 1M токенов бесплатно, потом $0.018/1M | нет — нужна миграция V27 |
| **Cloudflare Workers AI** `bge-small-en-v1.5` | **384** | бесплатный tier (100k req/day) | **да, без изменений** |
| OpenAI `text-embedding-3-small` | 1536 | $0.02/1M токенов | нет — нужна миграция V27 |

**Выбор: Jina AI** — лучшее качество в своём классе среди бесплатных,
бесплатный tier на 1M токенов хватит надолго.
Единственная правка — миграция V27 меняет `vector(384)` → `vector(768)`.

> Если хочешь нулевых правок к схеме — возьми Cloudflare Workers AI (384 dim).
> Для продакшн-качества — Jina (768 dim) лучше.

---

## Архитектура решения

```
ProfileUpdatedEvent
       |
VectorizationService.onProfileUpdated()
       |
       ├── собирает List<String> (тексты проектов и опыта)
       |
       ↓
JinaEmbeddingClient.embed(List<String>) → POST https://api.jina.ai/v1/embeddings
       |
       ↓  float[][] vectors
       |
PgVectorRepository.upsert(userId, texts, vectors)
       |
       ↓
vector_store (PostgreSQL + pgvector)
       |
AiApplicationService.generateCoverLetter()
       |
PgVectorRepository.findSimilar(userId, queryVector, topK=4)
       |
       ↓  List<String> relevantContext
       |
Groq LLM prompt
```

**Ключевое решение:** не используем `spring-ai` `VectorStore` / `EmbeddingModel` бины вообще.
Пишем `PgVectorRepository` (чистый JDBC) и `JinaEmbeddingClient` (WebClient).
`MockVectorStoreConfig` удаляем, `VectorStore` бин убираем из `AiApplicationService`.

---

## Структура новых файлов

```
backend/src/main/java/com/medev/modules/ai/
├── config/
│   └── MockVectorStoreConfig.java          (УДАЛИТЬ)
├── embedding/
│   ├── JinaEmbeddingClient.java            (NEW) HTTP-клиент к Jina API
│   └── PgVectorRepository.java             (NEW) JDBC upsert + cosine search
└── service/
    ├── VectorizationService.java           (ИЗМЕНИТЬ — убрать VectorStore, использовать новые бины)
    └── AiApplicationService.java           (ИЗМЕНИТЬ — убрать VectorStore, использовать PgVectorRepository)

backend/src/main/resources/db/migration/
└── V27__update_vector_dimensions.sql       (NEW) 384 → 768
```

---

## Roadmap по шагам

### Шаг 1 — Миграция схемы (5 мин)
Файл: `V27__update_vector_dimensions.sql`

```sql
-- Пересоздаём с правильной размерностью
DROP INDEX IF EXISTS vector_store_embedding_idx;
ALTER TABLE vector_store DROP COLUMN IF EXISTS embedding;
ALTER TABLE vector_store ADD COLUMN embedding vector(768);
CREATE INDEX ON vector_store USING HNSW (embedding vector_cosine_ops);
```

### Шаг 2 — Jina HTTP клиент (30 мин)
Файл: `embedding/JinaEmbeddingClient.java`

- `WebClient` POST к `https://api.jina.ai/v1/embeddings`
- Принимает `List<String>` → возвращает `List<float[]>`
- `@Value("${jina.api-key}")` из env
- Retry 2x на 5xx, timeout 10s
- Паттерн — копия `GroqClient`, уже знаешь как писать

### Шаг 3 — JDBC репозиторий (20 мин)
Файл: `embedding/PgVectorRepository.java`

- `upsert(Long userId, List<String> texts, List<float[]> vectors)`:
  сначала `DELETE FROM vector_store WHERE metadata->>'userId' = ?`,
  потом batch INSERT с `::vector` кастом
- `findSimilar(Long userId, float[] queryVector, int topK)`:
  ```sql
  SELECT content FROM vector_store
  WHERE metadata->>'userId' = ?
  ORDER BY embedding <=> ?::vector
  LIMIT ?
  ```
- Чистый `JdbcTemplate`, никаких Spring AI бинов

### Шаг 4 — Рефактор VectorizationService (15 мин)
- Убрать `VectorStore vectorStore` из зависимостей
- Добавить `JinaEmbeddingClient` и `PgVectorRepository`
- Логика: собрать тексты → `jinaClient.embed(texts)` → `pgVectorRepo.upsert(userId, texts, vectors)`
- Блок `try/catch` с `log.error` — асинхронный метод, падение не должно крашить основной поток

### Шаг 5 — Рефактор AiApplicationService (15 мин)
- Убрать `VectorStore vectorStore` из зависимостей
- Добавить `JinaEmbeddingClient` и `PgVectorRepository`
- В `generateCoverLetter` и `tailorResume`:
  ```
  queryVector = jinaClient.embed(List.of(jobDescription)).get(0)
  relevantDocs = pgVectorRepo.findSimilar(userId, queryVector, 4)
  ```

### Шаг 6 — Удалить MockVectorStoreConfig (1 мин)
- Удалить файл `MockVectorStoreConfig.java`
- Проверить что `spring-ai-core` в `build.gradle` не тянет авто-конфиг `VectorStore`
  (если тянет — добавить `spring.autoconfigure.exclude` в `application.yml`)

### Шаг 7 — Env переменная (2 мин)
- Добавить в Render env: `JINA_API_KEY=jina_...`
- В `application.yml`: `jina.api-key: ${JINA_API_KEY:}`

### Шаг 8 — Ручной тест (10 мин)
1. Обновить профиль → лог `Successfully vectorized N items for user X`
2. Запрос к `vector_store` — строки появились, `embedding` не null
3. `generateCoverLetter` — в промпте появился конкретный опыт из профиля

---

## Риски

| # | Риск | Уровень | Митигация |
|---|---|---|---|
| 1 | Jina API down во время индексации | WARNING | `@Async` — не блокирует пользователя; retry 2x; лог ошибки |
| 2 | `spring-ai-core` регистрирует авто-конфиг VectorStore и падает без бина | WARNING | `spring.autoconfigure.exclude: org.springframework.ai.autoconfigure.vectorstore.pgvector.PgVectorStoreAutoConfiguration` |
| 3 | Старые строки в `vector_store` с `vector(384)` после миграции | INFO | V27 дропает и пересоздаёт колонку — таблица будет пустой, первый `ProfileUpdatedEvent` переиндексирует |
| 4 | Jina квота исчерпана (1M токенов) | INFO | Одна запись профиля — ~500 токенов. 1M хватит на ~2000 полных индексаций. Потом $0.018/1M |

---

## Что не меняется

- `V18__add_vector_embeddings.sql` — остаётся (создаёт таблицу), V27 только меняет колонку
- Логика `@Scheduled` cleanup в `VectorizationService` — работает без изменений
- `ProfileUpdatedEvent` — без изменений
- Все остальные AI сервисы — без изменений
- Groq — без изменений

---

## После Plan A — задел на Plan B

Когда RAG заработает, Plan B (Semantic Job Match) требует:
- добавить `type=VACANCY` в метаданные при индексации вакансий из трекера
- один SQL запрос: `ORDER BY vacancy_embedding <=> profile_embedding LIMIT 5`
- вся инфраструктура (`JinaEmbeddingClient`, `PgVectorRepository`) уже есть

**Итого Plan A: ~1.5 часа работы. 0 новых зависимостей в `build.gradle`.**
