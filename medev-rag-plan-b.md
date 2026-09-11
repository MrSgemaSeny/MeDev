# MeDev RAG — Plan B: Semantic Job Match Engine

**Зависимость:** Plan A должен быть завершён.
`JinaEmbeddingClient` и `PgVectorRepository` уже существуют.

---

## Суть

Сейчас `matchScore` и `matchFeedback` в `JobApplication` заполняются через LLM:
`AiApplicationService.matchJob()` отправляет весь профиль в Groq и получает `{score, feedback}`.
Это медленно, дорого по токенам, и не масштабируется.

Plan B добавляет **векторный матчинг**: вакансия при добавлении в трекер
векторизуется и сравнивается с профилем через cosine similarity.
Результат — мгновенный скор из SQL без LLM.
LLM остаётся только для человекочитаемого `feedback` (опционально).

---

## Что есть уже (ничего трогать не нужно)

| Компонент | Статус |
|---|---|
| `job_applications.match_score` (V21) | есть |
| `job_applications.match_feedback` (V21) | есть |
| `job_applications.job_description` (V21) | есть |
| `AiApplicationService.matchJob()` | есть — LLM-based, оставляем как fallback |
| `JinaEmbeddingClient` (Plan A) | есть |
| `PgVectorRepository` (Plan A) | есть — добавим методы для вакансий |

---

## Изменения схемы

### V28 — добавить вектор к вакансиям

```sql
-- V28__add_vacancy_vector.sql
ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS job_embedding vector(768);

CREATE INDEX IF NOT EXISTS idx_job_applications_embedding
    ON job_applications USING HNSW (job_embedding vector_cosine_ops);
```

Вектор хранится прямо в `job_applications`, не в `vector_store`.
Причина: вакансия — это одна запись с owner, удаление каскадное.
Отдельная таблица `vector_store` для вакансий создаст orphan-проблему.

---

## Архитектура

```
POST /v1/tracker/applications  (create)
POST /v1/tracker/applications/{id}  (update с новым job_description)
           |
           ↓
JobApplicationService.create() / update()
           |
           ↓  asyncAfterCommit
VacancyVectorizationService.vectorizeAndMatch(jobApplicationId)
           |
           ├── jinaClient.embed(jobDescription)  → float[] vacancyVector
           |
           ├── pgVectorRepo.findSimilar(userId, vacancyVector, topK=5)
           |   → List<String> relevantProfileChunks
           |
           ├── cosineSimilarity(vacancyVector, profileVector)  → float score (0.0–1.0)
           |   (берём max среди topK, или avg — настраиваемо)
           |
           ├── matchScore = (int)(score * 100)
           |
           └── UPDATE job_applications SET job_embedding=?, match_score=? WHERE id=?
```

**LLM feedback — опционально и асинхронно:**
Если `matchScore >= 40` — запускаем `AiApplicationService.matchJob()` в фоне
для генерации `match_feedback`. Если `< 40` — feedback = стандартная фраза,
токены не тратим.

---

## Структура новых файлов

```
backend/src/main/java/com/medev/modules/
├── tracker/
│   └── service/
│       └── VacancyVectorizationService.java    (NEW)
└── ai/
    └── embedding/
        └── PgVectorRepository.java             (ИЗМЕНИТЬ — добавить методы для вакансий)

backend/src/main/resources/db/migration/
└── V28__add_vacancy_vector.sql                 (NEW)
```

---

## Roadmap по шагам

### Шаг 1 — Миграция V28 (2 мин)
Добавить `job_embedding vector(768)` + HNSW индекс к `job_applications`.

### Шаг 2 — Расширить PgVectorRepository (20 мин)

Добавить два метода:

```java
// Сохранить вектор вакансии
void saveVacancyEmbedding(Long jobApplicationId, float[] vector);

// Получить агрегированный вектор профиля пользователя
// (средний по всем его chunk-векторам из vector_store)
float[] getAggregatedProfileVector(Long userId);
```

`getAggregatedProfileVector` — один SQL:
```sql
SELECT AVG(embedding) FROM vector_store WHERE metadata->>'userId' = ?
```
pgvector поддерживает `AVG` по векторам нативно.

### Шаг 3 — VacancyVectorizationService (40 мин)
Файл: `tracker/service/VacancyVectorizationService.java`

```
@Async
public void vectorizeAndMatch(Long userId, Long jobApplicationId, String jobDescription):

  1. jinaClient.embed(List.of(jobDescription))  → vacancyVector
  2. pgVectorRepo.saveVacancyEmbedding(jobApplicationId, vacancyVector)
  3. profileVector = pgVectorRepo.getAggregatedProfileVector(userId)
     если profileVector == null:
         matchScore = null  (профиль ещё не векторизован)
         return
  4. score = cosineSimilarity(vacancyVector, profileVector)  (утилитный метод)
  5. matchScore = (int)(score * 100)
  6. UPDATE job_applications SET match_score = ? WHERE id = ?
  7. если matchScore >= 40:
         async → AiApplicationService.matchJob() → UPDATE match_feedback
```

Вспомогательный метод cosine:
```java
private float cosineSimilarity(float[] a, float[] b) {
    float dot = 0, normA = 0, normB = 0;
    for (int i = 0; i < a.length; i++) {
        dot   += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (float)(Math.sqrt(normA) * Math.sqrt(normB));
}
```

### Шаг 4 — Подключить к JobApplicationService (15 мин)

В `create()` и `update()` — после `repository.save(entity)`:
```java
if (entity.getJobDescription() != null && !entity.getJobDescription().isBlank()) {
    vacancyVectorizationService.vectorizeAndMatch(
        userId, entity.getId(), entity.getJobDescription()
    );
}
```

`@Async` — не блокирует ответ пользователю. Ответ придёт мгновенно,
`match_score` появится в `job_applications` через 1-2 секунды.

### Шаг 5 — Endpoint для ручного пересчёта (10 мин)

```
POST /v1/tracker/applications/{id}/rematch
```

Нужен когда пользователь обновил профиль после добавления вакансии.
Просто вызывает `vectorizeAndMatch()` заново.

### Шаг 6 — JobApplicationDto (5 мин)

`matchScore` уже есть в DTO. Ничего не меняется — клиент уже получает поле,
просто теперь оно заполняется быстро и без LLM-звонка.

---

## UX на фронтенде (не в этом плане, но важно обозначить)

После Plan B можно добавить в трекер:
- индикатор совпадения рядом с каждой карточкой (0–100%)
- цветовое кодирование: `>= 70` зелёный, `40–69` жёлтый, `< 40` красный
- сортировка вакансий по `match_score` DESC

---

## Риски

| # | Риск | Уровень | Митигация |
|---|---|---|---|
| 1 | Профиль не векторизован когда добавляется вакансия | WARNING | Проверяем `profileVector == null`, ставим `match_score = null`, UI показывает "Analysing..." |
| 2 | `AVG(embedding)` по пустой таблице → null | INFO | `Optional.ofNullable` в репозитории |
| 3 | Jina лимит при массовом импорте вакансий | WARNING | Rate-limit в `JinaEmbeddingClient` (уже есть retry), добавить delay между batch-запросами |
| 4 | LLM feedback тратит токены на мусорные вакансии | INFO | Порог `>= 40` перед вызовом Groq отсекает нерелевантные |
| 5 | `cosineSimilarity` Java vs pgvector `<=>` — разные результаты | INFO | После Plan A используем pgvector для поиска chunks, cosine Java только для агрегированного скора. Расхождение < 0.01, не критично |

---

## Итог двух планов

```
Plan A (1.5 ч):
  vector_store наполнена реальными векторами профиля
  generateCoverLetter / tailorResume тянут контекст из pgvector
  RAG работает

Plan B (+2 ч):
  каждая вакансия в трекере получает job_embedding
  match_score считается через cosine similarity за ~1 сек
  LLM тратится только на feedback для релевантных вакансий
  endpoint /rematch для ручного пересчёта

Итого: ~3.5 ч работы, 0 новых зависимостей, 1 новый env var (JINA_API_KEY).
```
