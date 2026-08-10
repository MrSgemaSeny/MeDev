# MeDev -- Вектор улучшения системы

> Дата: 2026-08-10
> Источник: аудит кодовой базы по состоянию на конец Фазы 3

---

## 1. Backend: архитектура и код

### [CRITICAL] ProfileService.java -- God Service (472 строки)

Проблема: один сервис содержит CRUD для 6 сущностей (Profile, Experience, Education, Skill, Language, Project) + маппинг + GitHub импорт + reorder логику. Нарушает SRP.

```
Текущее состояние:
  ProfileService.java (472 строк)
    - CRUD Experience (5 методов)
    - CRUD Education (5 методов)
    - CRUD Skills (5 методов)
    - CRUD Languages (5 методов)
    - CRUD Projects (5 методов)
    - 6 ручных маппер-методов (mapToExperienceDto, mapToEducationDto...)
    - GitHub импорт (updateFromGitHub, importProjects, addSkillIfNotExists)

Целевое состояние:
  ProfileService.java          -- только Profile CRUD и оркестрация
  ExperienceService.java       -- CRUD + reorder для Experience
  EducationService.java        -- CRUD + reorder для Education
  SkillService.java            -- CRUD + reorder для Skills
  LanguageService.java         -- CRUD + reorder для Languages
  ProjectService.java          -- CRUD + reorder для Projects
  ProfileMapper.java           -- MapStruct интерфейс для всех DTO-Entity маппингов
```

Действие: добавить MapStruct в build.gradle, вынести маппинг в отдельный слой.

---

### [CRITICAL] Нет тестов

Бэкенд компилируется, но ни одного теста не написано. compileTestJava проходит потому что тестов нет.

```
Минимальный набор:
  - AuthServiceTest          -- register, login, refresh, logout, дубликат email
  - JwtServiceTest           -- генерация, валидация, expiration, deviceId
  - ProfileServiceTest       -- CRUD, reorder, ownership check (IDOR защита)
  - AiAnalysisServiceTest    -- парсинг PDF, обработка пустого файла, маппинг JSON
  - PdfGeneratorServiceTest  -- генерация с пустым профилем, с полным профилем

Инструменты:
  - JUnit 5 + Mockito (уже в spring-boot-starter-test)
  - TestContainers для PostgreSQL + Redis (integration)
```

---

### [WARNING] Ручные мапперы -- дублирование кода

6 методов mapToXxxDto в ProfileService -- copy-paste маппинг. При добавлении поля в entity легко забыть обновить маппер.

```java
// Сейчас (ручной маппинг, 60+ строк boilerplate):
private ExperienceDto mapToExperienceDto(Experience exp) {
    ExperienceDto dto = new ExperienceDto();
    dto.setId(exp.getId());
    dto.setCompany(exp.getCompany());
    // ... 8 полей
}

// Целевое (MapStruct, 0 строк boilerplate):
@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ExperienceDto toDto(Experience entity);
    EducationDto toDto(Education entity);
    SkillDto toDto(Skill entity);
    // MapStruct генерирует реализацию на этапе компиляции
}
```

---

### [WARNING] GroqClient -- нет устойчивости

Текущая реализация: один синхронный вызов через WebClient.block() без timeout, retry, fallback.

```
Проблемы:
  1. Нет timeout -- если Groq API висит, поток заблокирован навсегда
  2. Нет retry -- 503 от Groq убивает запрос сразу
  3. Нет circuit breaker -- если Groq лежит, все запросы копятся
  4. Нет fallback -- пользователь получает 500 без объяснения

Целевое:
  - WebClient timeout: 30s connect, 60s read
  - Retry: 3 попытки с exponential backoff (1s, 2s, 4s)
  - Graceful degradation: вернуть частично заполненный профиль вместо ошибки
  - Structured error response: "AI сервис временно недоступен, заполните вручную"
```

---

### [WARNING] AiAnalysisService -- хрупкий парсинг JSON

Groq возвращает JSON, но нет валидации структуры. Если LLM вернет невалидный JSON или JSON с неожиданными полями -- RuntimeException.

```
Улучшения:
  1. Try-catch вокруг ObjectMapper.readValue() с fallback
  2. Валидация обязательных полей после десериализации
  3. Логирование raw ответа от Groq при ошибке парсинга (для дебага)
  4. System prompt ужесточить: "Return ONLY valid JSON, no markdown fences"
```

---

### [WARNING] GlobalExceptionHandler -- неполный

Отсутствует обработка:
  - MethodArgumentNotValidException (ошибки @Valid) -- сейчас Spring возвращает стандартный 400 без структуры
  - HttpMessageNotReadableException (битый JSON в body)
  - MaxUploadSizeExceededException (слишком большой PDF)
  - GroqClient-специфичные ошибки

```java
// Нужно добавить:
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
    Map<String, String> errors = new HashMap<>();
    e.getBindingResult().getFieldErrors().forEach(err ->
        errors.put(err.getField(), err.getDefaultMessage())
    );
    return ResponseEntity.badRequest().body(Map.of("errors", errors));
}
```

---

### [INFO] SecurityConfig -- Rate Limiting

Нет rate limiting на эндпоинтах. Один пользователь может спамить:
  - POST /v1/auth/login (brute force)
  - POST /v1/ai/parse-resume (дорогой Groq API вызов)
  - GET /v1/resume/generate (PDF генерация -- CPU intensive)

```
Решение: Bucket4j + Redis (или Spring Cloud Gateway rate limiter)
  - /auth/login: 5 попыток / минута на IP
  - /ai/parse-resume: 3 запроса / час на userId
  - /resume/generate: привязать к плану (Free: 3/день, Pro: безлимит)
```

---

## 2. Frontend: качество и производительность

### [CRITICAL] Нет code splitting

Все страницы загружаются в один бандл. При росте приложения TTI (Time to Interactive) деградирует.

```tsx
// Сейчас (все в одном чанке):
import { ResumeBuilder } from './features/resume/ResumeBuilder';

// Целевое (lazy loading per route):
const ResumeBuilder = lazy(() => import('./features/resume/ResumeBuilder'));
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage'));

// В router:
<Suspense fallback={<PageSkeleton />}>
  <Route path="/builder" element={<ResumeBuilder />} />
</Suspense>
```

---

### [WARNING] Axios interceptor -- нет retry и refresh token flow

Если access token истек, запрос просто падает с 401. Нет автоматического refresh + retry.

```
Целевое:
  axios.interceptors.response (401) ->
    вызвать /auth/refresh ->
    обновить токен в store ->
    retry оригинальный запрос

  + очередь запросов во время refresh (чтобы не слать 10 refresh параллельно)
```

---

### [WARNING] i18n -- только ResumeBuilder переведен

react-i18next подключен, но переводы покрывают только ResumeBuilder. Остальной UI -- захардкоженные строки на английском.

```
Непереведенные компоненты:
  - LoginPage, RegisterPage
  - DashboardPage
  - ProfileEditPage
  - Sidebar / Navigation
  - Toast сообщения (toast.error, toast.success)
  - Публичное портфолио
```

---

### [INFO] FSD структура -- частично

Feature-Sliced Design заявлен, но не выдержан:
  - entities/ есть, но не все сущности там
  - shared/ui/ не покрывает все переиспользуемые компоненты
  - pages/ содержат бизнес-логику вместо композиции фичей

---

### [INFO] Нет frontend тестов

Ни unit (Vitest), ни E2E (Playwright). Минимальный набор:
  - Vitest: утилиты, хуки, store
  - Playwright: регистрация -> логин -> заполнение профиля -> скачивание PDF

---

## 3. Инфраструктура

### [CRITICAL] CI/CD -- GitHub Actions

Нужен пайплайн который блокирует мерж при ошибках:

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  backend:
    - ./gradlew build (компиляция + тесты)
    - ./gradlew jacocoTestReport (покрытие)
  frontend:
    - npm ci
    - npm run lint
    - npm run build
    - npm test (когда появятся тесты)
```

---

### [WARNING] Нет fly.toml / Dockerfile для backend

Деплой на Fly.io запланирован, но конфигурация не создана.

```
Нужно:
  - fly.toml с настройками инстанса (shared-cpu-1x, 256MB для старта)
  - Multi-stage Dockerfile: gradle build -> JRE runtime image
  - Health check: /api/actuator/health
  - Secrets: JWT_SECRET, DATABASE_URL, GROQ_API_KEY через fly secrets
```

---

### [INFO] Логирование -- нет структуры

Текущее: стандартный Spring Boot logback (plain text). В production нужен JSON для парсинга.

```
Улучшения:
  - logback-spring.xml с JSON encoder для prod профиля
  - MDC: userId, requestId в каждом лог-сообщении
  - Отдельный лог для audit trail (кто что менял в профиле)
```

---

## 4. Безопасность

### [CRITICAL] CORS -- wildcard в dev, не проверен для prod

Нужно убедиться что CorsConfig в production разрешает только конкретные origins.

---

### [WARNING] Groq API key в application.yml

Key читается из env var, но нет валидации при старте. Если GROQ_API_KEY не задан, приложение стартует и падает только при первом запросе.

```java
// Добавить @PostConstruct валидацию:
@PostConstruct
public void validateConfig() {
    if (apiKey == null || apiKey.isBlank()) {
        log.warn("GROQ_API_KEY not set -- AI features will be disabled");
    }
}
```

---

### [WARNING] Нет file size limit на PDF upload

MultipartFile принимается без ограничений. Пользователь может загрузить 500MB файл.

```yaml
# application.yml:
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

---

## 5. Приоритеты реализации

```
Sprint 1 (неделя):
  [CRITICAL] CI/CD pipeline (GitHub Actions)
  [CRITICAL] Unit тесты на AuthService + JwtService
  [CRITICAL] Code splitting (lazy routes) на фронте
  [WARNING]  File size limit на upload
  [WARNING]  MethodArgumentNotValidException в GlobalExceptionHandler

Sprint 2 (неделя):
  [CRITICAL] ProfileService декомпозиция (разбить на 6 сервисов)
  [WARNING]  MapStruct вместо ручных мапперов
  [WARNING]  GroqClient timeout + retry
  [WARNING]  Axios refresh token interceptor

Sprint 3 (неделя):
  [WARNING]  Rate limiting (Bucket4j)
  [WARNING]  i18n -- перевести все компоненты
  [WARNING]  fly.toml + Dockerfile
  [INFO]     Structured logging (JSON)
  [INFO]     FSD рефакторинг фронта
```
