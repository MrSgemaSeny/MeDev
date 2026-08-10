# MeDev — AI Integration Plan

## Контекст для AI агента

Проект MeDev — платформа для разработчиков (генератор резюме + публичное портфолио).
Бэкенд: Spring Boot 3, Java 17, PostgreSQL, Redis, Groq API (уже подключён через GroqClient.java).
Фронтенд: React 19, TypeScript, Vite, Tailwind v4, FSD архитектура.

Базовая AI интеграция уже есть:
- `GroqClient.java` — SSE стриминг через WebClient
- `AiController.java` — эндпоинт `POST /api/v1/ai/chat/stream`
- `AiAssistantService.java` — базовый промпт
- `AiChatWidget.tsx` — плавающий виджет на фронтенде

Задача: расширить до полноценного контекстного AI который знает пользователя.

---

## Архитектура

```
Пользователь → фронтенд
                  ↓
         POST /api/v1/ai/chat/stream
         + заголовок Authorization: Bearer <token>
                  ↓
         AiController извлекает userId из JWT
                  ↓
         AiContextService собирает контекст:
           - Profile из БД (about, experience, education, skills, projects)
           - GitHub данные если подключены
           - plan пользователя (FREE/PRO)
                  ↓
         Формируется system prompt с контекстом
                  ↓
         GroqClient → SSE поток токенов
                  ↓
         Фронтенд рендерит токен за токеном
```

---

## Бэкенд — что добавить

### 1. AiContextService.java

Новый сервис который собирает контекст пользователя для system prompt.

```java
// src/main/java/com/medev/modules/ai/service/AiContextService.java

@Service
@RequiredArgsConstructor
public class AiContextService {

    private final ProfileService profileService;
    private final GitHubService gitHubService;
    private final UserRepository userRepository;

    public String buildSystemPrompt(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        ProfileDto profile = profileService.getProfile(userId);

        StringBuilder sb = new StringBuilder();
        sb.append("Ты — AI ассистент платформы MeDev для разработчиков.\n");
        sb.append("Ты знаешь профиль пользователя и помогаешь улучшить резюме и портфолио.\n");
        sb.append("Отвечай конкретно, без воды. Давай actionable советы.\n\n");

        sb.append("=== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ===\n");
        sb.append("Имя: ").append(profile.getFullName()).append("\n");
        sb.append("Должность: ").append(profile.getHeadline()).append("\n");
        sb.append("Summary: ").append(profile.getSummary()).append("\n");
        sb.append("Локация: ").append(profile.getLocation()).append("\n");
        sb.append("Тариф: ").append(user.getPlan()).append("\n\n");

        if (profile.getExperience() != null && !profile.getExperience().isEmpty()) {
            sb.append("=== ОПЫТ ===\n");
            profile.getExperience().forEach(e ->
                sb.append("- ").append(e.getPosition()).append(" в ").append(e.getCompany())
                  .append(" (").append(e.getStartDate()).append(" — ").append(e.getEndDate()).append(")\n")
                  .append("  ").append(e.getDescription()).append("\n")
            );
            sb.append("\n");
        }

        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            sb.append("=== НАВЫКИ ===\n");
            profile.getSkills().forEach(s ->
                sb.append("- ").append(s.getName()).append(" (").append(s.getLevel()).append(")\n")
            );
            sb.append("\n");
        }

        if (profile.getProjects() != null && !profile.getProjects().isEmpty()) {
            sb.append("=== ПРОЕКТЫ ===\n");
            profile.getProjects().forEach(p ->
                sb.append("- ").append(p.getName()).append(": ").append(p.getDescription()).append("\n")
                  .append("  URL: ").append(p.getUrl()).append("\n")
            );
            sb.append("\n");
        }

        if (profile.getGithubUsername() != null) {
            sb.append("=== GITHUB ===\n");
            sb.append("Username: ").append(profile.getGithubUsername()).append("\n");
            // GitHub данные если уже импортированы — добавить репозитории
        }

        return sb.toString();
    }
}
```

### 2. Обновить AiController.java

Добавить извлечение userId из JWT и передачу в сервис.

```java
// src/main/java/com/medev/modules/ai/controller/AiController.java

@PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter streamChat(
        @RequestBody ChatRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {

    Long userId = securityUtils.getUserId(userDetails);
    String systemPrompt = aiContextService.buildSystemPrompt(userId);

    return aiAssistantService.streamChat(request.getMessage(), systemPrompt);
}
```

### 3. Обновить AiAssistantService.java

Принимать systemPrompt как параметр вместо хардкода.

```java
public SseEmitter streamChat(String userMessage, String systemPrompt) {
    SseEmitter emitter = new SseEmitter(60_000L);

    groqClient.streamCompletion(systemPrompt, userMessage)
        .subscribe(
            token -> { /* отправить токен */ },
            emitter::completeWithError,
            emitter::complete
        );

    return emitter;
}
```

### 4. Rate limiting для AI эндпоинта

Free: 10 запросов в день к AI.
Pro: 100 запросов в день.

Через Bucket4j (уже есть в проекте):

```java
// В RateLimitFilter или отдельный AiRateLimitFilter
// FREE: 10 req/day, PRO: 100 req/day
// Ключ: "ai:" + userId
```

---

## Сценарии использования — что AI умеет делать

### Сценарий 1: Генерация контента по GitHub

Пользователь нажимает "Generate with AI" рядом с полем Summary или Projects.

Фронтенд отправляет специальный промпт:
```
"Сгенерируй профессиональный summary для резюме на основе моего профиля.
 Максимум 3 предложения. Фокус на стеке и ключевых проектах."
```

AI уже знает профиль из system prompt → отвечает конкретно.

### Сценарий 2: Анализ резюме

Кнопка "Analyze Resume" на странице `/resume`.

Промпт:
```
"Проанализируй моё резюме и дай конкретные рекомендации:
 1. Что слабо и почему
 2. Что добавить
 3. Что убрать
 Будь прямым, без воды."
```

### Сценарий 3: Анализ GitHub профиля

Кнопка "Analyze GitHub" в GitHub секции.

Перед запросом бэкенд делает свежий fetch GitHub API для этого пользователя
и добавляет данные в контекст:
- список репозиториев (название, язык, stars, last commit)
- топ языки по количеству байт кода
- количество публичных репозиториев

Промпт:
```
"Проанализируй мой GitHub профиль:
 1. Какие проекты стоит выделить в резюме и почему
 2. Что говорит мой стек о моём уровне
 3. Что улучшить в GitHub профиле для рекрутеров"
```

### Сценарий 4: Свободный чат с контекстом

Плавающий виджет (уже есть) — пользователь задаёт любой вопрос.
AI всегда отвечает в контексте профиля пользователя.

---

## Фронтенд — что добавить

### AiChatWidget.tsx — обновить

Текущий виджет не передаёт Authorization header. Добавить:

```tsx
const { accessToken } = useAuthStore();

const response = await fetch('/api/v1/ai/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ message }),
});
```

### Кнопки "Generate with AI" в секциях профиля

В каждой секции ProfileEditPage добавить кнопку рядом с полем:

```tsx
// AboutSection.tsx
<button onClick={() => generateWithAI('summary')}>
  Generate with AI
</button>
```

Компонент `useAiGenerate` хук:

```tsx
// src/features/ai/hooks/useAiGenerate.ts
export function useAiGenerate() {
  const { accessToken } = useAuthStore();

  const generate = async (prompt: string, onToken: (token: string) => void) => {
    const response = await fetch('/api/v1/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message: prompt }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      // парсинг SSE
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const token = line.slice(6);
          if (token !== '[DONE]') onToken(token);
        }
      }
    }
  };

  return { generate };
}
```

### Страница анализа резюме

На `/resume` добавить секцию "AI Feedback" (только Pro):

```tsx
<AiFeedbackPanel />  // показывает анализ резюме
```

---

## Free vs Pro для AI

| Функция | Free | Pro |
|---|---|---|
| Чат с AI | 10 запросов/день | 100 запросов/день |
| Generate with AI (поля) | нет | да |
| Анализ резюме | нет | да |
| Анализ GitHub | 1 раз | безлимит |

---

## Порядок реализации

### Фаза 1 — Контекстный system prompt (бэкенд)
1. Создать `AiContextService.java`
2. Обновить `AiController.java` — добавить JWT извлечение userId
3. Обновить `AiAssistantService.java` — принимать systemPrompt
4. Обновить `AiChatWidget.tsx` — добавить Authorization header
5. Проверить: виджет отвечает с учётом профиля пользователя

### Фаза 2 — Анализ GitHub
6. В `AiContextService` добавить fetch GitHub API перед формированием промпта
7. Добавить кнопку "Analyze GitHub" в GitHub секцию профиля
8. Проверить: AI анализирует реальные репозитории

### Фаза 3 — Generate with AI в редакторе
9. Создать хук `useAiGenerate.ts`
10. Добавить кнопки "Generate" в AboutSection (summary) и ProjectsSection
11. Проверить: AI генерирует текст прямо в поля формы

### Фаза 4 — Анализ резюме (Pro)
12. Создать `AiFeedbackPanel.tsx` на странице `/resume`
13. Добавить проверку плана (только Pro)
14. Rate limiting через Bucket4j

---

## Критические правила

1. НИКОГДА не передавать GROQ_API_KEY на фронтенд — только через бэкенд прокси
2. Все AI запросы требуют авторизации — `@AuthenticationPrincipal` обязателен
3. Rate limiting обязателен до запуска в продакшн
4. GitHub fetch в AiContextService — кэшировать в Redis (TTL 1 час), не дёргать API при каждом запросе
5. System prompt не должен превышать ~2000 токенов — обрезать длинные описания
6. SSE стриминг — не менять, он уже работает
7. Тесты после каждой фазы перед следующей
