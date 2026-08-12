# medev — план внедрения: антигаллюцинация + GitHub GraphQL

---

## Шаг 1 — Запрет галлюцинаций в system prompt (быстрый fix)

**Цель:** LLM перестаёт выдумывать данные, которых нет в контексте.  
**Затраты:** ~30 минут, только backend.  
**Файл:** `backend/src/main/java/com/medev/modules/ai/service/AiService.java` (или где собирается system prompt).

### Что менять

Найти место, где формируется system prompt для чат-ассистента. Сейчас там примерно:

```
You are a career assistant. The user has the following GitHub repositories: [list].
```

Заменить на явно ограниченный шаблон:

```
You are a career assistant helping the user with their developer profile.

You have access ONLY to the following data about the user's GitHub:
<github_data>
  repositories: {{repoNames}}
  languages: {{languages}}
  bio: {{bio}}
</github_data>

STRICT RULES:
- If the user asks about commits, lines of code, contribution count, or any metric 
  NOT present in <github_data> — respond exactly:
  "I don't have access to that data yet. You can connect detailed GitHub stats in Settings."
- Do NOT estimate, approximate, or infer missing values.
- Do NOT use phrases like "based on your activity" if that activity is not in your context.
```

### Как проверить

Спросить ассистента: *"Сколько коммитов я сделал за последние 2 месяца?"*  
Ожидаемый ответ: фраза про отсутствие данных, без выдуманных цифр.

---

## Шаг 2 — GitHub GraphQL: реальные данные активности

**Цель:** подтянуть реальные коммиты за период и передать их в system prompt.  
**Затраты:** 3–5 часов, только backend.

### 2.1 — GraphQL-запрос

GitHub GraphQL API: `https://api.github.com/graphql`  
Требует: `githubAccessToken` из `Profile` (уже хранится в БД, зашифрован).

```graphql
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalRepositoriesWithContributedCommits
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
      }
    }
  }
}
```

Переменные:
- `from` — 90 дней назад, ISO 8601
- `to` — текущий момент, ISO 8601

Возвращает: количество коммитов, репозиториев с вкладом, всего contribution-events за период.

### 2.2 — Новый класс в модуле `github`

```
backend/src/main/java/com/medev/modules/github/
  service/
    GitHubService.java          ← уже есть (список репо)
    GitHubGraphQLService.java   ← новый
  dto/
    GitHubStatsDto.java         ← новый
```

**`GitHubStatsDto.java`**
```java
// backend/src/main/java/com/medev/modules/github/dto/GitHubStatsDto.java
public record GitHubStatsDto(
    int totalCommits,
    int totalRepositoriesContributed,
    int totalContributions,
    LocalDate from,
    LocalDate to
) {}
```

**`GitHubGraphQLService.java`** — скелет:
```java
// backend/src/main/java/com/medev/modules/github/service/GitHubGraphQLService.java
@Service
@RequiredArgsConstructor
public class GitHubGraphQLService {

    private final RestTemplate restTemplate; // или WebClient

    private static final String GRAPHQL_URL = "https://api.github.com/graphql";

    public GitHubStatsDto fetchContributions(String login, String accessToken) {
        String query = """
            query($login: String!, $from: DateTime!, $to: DateTime!) {
              user(login: $login) {
                contributionsCollection(from: $from, to: $to) {
                  totalCommitContributions
                  totalRepositoriesWithContributedCommits
                  contributionCalendar { totalContributions }
                }
              }
            }
            """;

        var from = ZonedDateTime.now().minusDays(90).toInstant().toString();
        var to = ZonedDateTime.now().toInstant().toString();

        var variables = Map.of("login", login, "from", from, "to", to);
        var body = Map.of("query", query, "variables", variables);

        var headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        var response = restTemplate.postForObject(
            GRAPHQL_URL,
            new HttpEntity<>(body, headers),
            Map.class
        );

        // парсинг response["data"]["user"]["contributionsCollection"]
        // обернуть в try-catch, при ошибке возвращать пустой GitHubStatsDto
    }
}
```

### 2.3 — Кэш в Redis

GitHub GraphQL имеет rate limit 5000 points/hour. Один запрос `contributionsCollection` ≈ 1 point.  
При каждом обращении к AI-ассистенту делать GraphQL-запрос — расточительно.

Стратегия: кэшировать результат в Redis с TTL = 1 час.

Ключ: `github:stats:{userId}`

```java
// в GitHubGraphQLService

@Autowired
private RedisTemplate<String, String> redisTemplate;

@Autowired
private ObjectMapper objectMapper;

public GitHubStatsDto fetchContributionsCached(Long userId, String login, String accessToken) {
    String key = "github:stats:" + userId;
    String cached = redisTemplate.opsForValue().get(key);

    if (cached != null) {
        return objectMapper.readValue(cached, GitHubStatsDto.class);
    }

    GitHubStatsDto stats = fetchContributions(login, accessToken);
    redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(stats), Duration.ofHours(1));
    return stats;
}
```

### 2.4 — Вставить данные в system prompt

В `AiService`, где строится контекст для чата:

```java
// получить статистику (из кэша или API)
GitHubStatsDto stats = gitHubGraphQLService.fetchContributionsCached(
    userId, profile.getGithubUsername(), decryptedToken
);

String systemPrompt = """
    ...
    <github_data>
      repositories: %s
      languages: %s
      bio: %s
      contributions_last_90_days:
        commits: %d
        repositories_contributed: %d
        total_contribution_events: %d
        period: %s to %s
    </github_data>
    ...
    """.formatted(
        repoNames, languages, bio,
        stats.totalCommits(),
        stats.totalRepositoriesContributed(),
        stats.totalContributions(),
        stats.from(), stats.to()
    );
```

### 2.5 — Граничные случаи

| Ситуация | Поведение |
|---|---|
| `githubAccessToken` не привязан | пропустить GraphQL, передать в prompt `contributions: unavailable` |
| GitHub API вернул ошибку / timeout | залогировать, вернуть пустой `GitHubStatsDto`, не падать |
| GitHub API вернул 202 (кэш ещё не готов) | retry 1 раз через 2 секунды, иначе пропустить |
| Пользователь не дал scope `read:user` при OAuth | `restrictedContributionsCount > 0` — упомянуть в prompt |

---

## Что НЕ делаем (и почему)

**Строки кода (lines added/deleted):**  
`/repos/{owner}/{repo}/stats/contributors` — N HTTP-запросов (по репо), каждый может вернуть 202 при первом вызове. Суммарные данные шумные (минификация, авто-генерация, рефакторинг). Польза для резюме сомнительна — не внедряем.

---

## Итоговый порядок внедрения

```
1. Обновить system prompt → запрет галлюцинаций       [30 мин]
2. Написать GitHubStatsDto                            [10 мин]
3. Написать GitHubGraphQLService.fetchContributions   [1.5 ч]
4. Добавить Redis-кэш в сервис                        [30 мин]
5. Встроить статистику в system prompt AiService      [30 мин]
6. Написать юнит-тест на GitHubGraphQLService         [45 мин]
7. Ручное тестирование: задать вопрос про коммиты     [15 мин]
```

Итого: ~4 часа чистого времени.
