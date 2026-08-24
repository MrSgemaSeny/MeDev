package com.medev.modules.github.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.github.dto.GitHubStatsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubGraphQLService {

    private final WebClient.Builder webClientBuilder;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String GRAPHQL_URL = "https://api.github.com/graphql";

    @SuppressWarnings("unchecked")
    public GitHubStatsDto fetchContributions(String login, String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            log.info("[GitHubGraphQL] Access token missing for user {}", login);
            return null;
        }

        String query = """
            query($login: String!, $from: DateTime!, $to: DateTime!) {
              user(login: $login) {
                contributionsCollection(from: $from, to: $to) {
                  totalCommitContributions
                  totalRepositoriesWithContributedCommits
                  contributionCalendar {
                    totalContributions
                  }
                }
              }
            }
            """;

        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("UTC"));
        String from = now.minusDays(90).toInstant().toString();
        String to = now.toInstant().toString();

        Map<String, Object> variables = Map.of("login", login, "from", from, "to", to);
        Map<String, Object> body = Map.of("query", query, "variables", variables);

        try {
            WebClient webClient = webClientBuilder.build();
            Map<String, Object> response = webClient.post()
                    .uri(GRAPHQL_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response == null || !response.containsKey("data")) {
                log.warn("[GitHubGraphQL] Invalid response for user {}: {}", login, response);
                return null;
            }

            Map<String, Object> data = (Map<String, Object>) response.get("data");
            Map<String, Object> user = (Map<String, Object>) data.get("user");
            if (user == null) {
                log.warn("[GitHubGraphQL] User {} not found via GraphQL", login);
                return null;
            }
            
            Map<String, Object> contributions = (Map<String, Object>) user.get("contributionsCollection");
            
            int totalCommits = (int) contributions.get("totalCommitContributions");
            int totalRepositoriesContributed = (int) contributions.get("totalRepositoriesWithContributedCommits");
            
            Map<String, Object> calendar = (Map<String, Object>) contributions.get("contributionCalendar");
            int totalContributions = (int) calendar.get("totalContributions");

            return new GitHubStatsDto(
                    totalCommits,
                    totalRepositoriesContributed,
                    totalContributions,
                    now.minusDays(90).toLocalDate(),
                    now.toLocalDate()
            );

        } catch (Exception e) {
            log.error("[GitHubGraphQL] Error fetching stats for user {}: {}", login, e.getMessage());
            return null;
        }
    }

    public GitHubStatsDto fetchContributionsCached(Long userId, String login, String accessToken) {
        if (login == null || login.isBlank()) {
            return null;
        }

        String cacheKey = "github:stats:" + userId;
        Object cached = redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            try {
                if (cached instanceof String) {
                    return objectMapper.readValue((String) cached, GitHubStatsDto.class);
                } else {
                    return objectMapper.convertValue(cached, GitHubStatsDto.class);
                }
            } catch (Exception e) {
                log.warn("[GitHubGraphQL] Failed to deserialize cached stats for user {}", userId, e);
                // Fallback to fetch
            }
        }

        GitHubStatsDto stats = fetchContributions(login, accessToken);
        if (stats != null) {
            try {
                redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(stats), Duration.ofHours(1));
            } catch (JsonProcessingException e) {
                log.error("[GitHubGraphQL] Failed to serialize stats for user {}", userId, e);
            }
        }
        return stats;
    }
}
