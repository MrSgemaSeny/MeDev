package com.medev.modules.ai.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.github.dto.GitHubStatsDto;
import com.medev.modules.github.service.GitHubGraphQLService;
import com.medev.modules.github.service.GitHubService;
import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Собирает system prompt для AI из профиля пользователя и GitHub данных.
 *
 * Кэш GitHub данных: @Cacheable("github-context") с TTL 1 час (настраивается в CacheConfig).
 * Кэш профиля не нужен — он инвалидируется при каждом обновлении.
 *
 * Бюджет токенов:
 * - System prompt: ~1800-2000 токенов максимум
 * - Каждый текстовый блок обрезается с запасом
 * - Грубая оценка: 1 токен ≈ 4 символа (для английского/русского)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiContextService {

    // Лимиты символов на блок — контролируем бюджет токенов
    private static final int MAX_SUMMARY_CHARS     = 800;
    private static final int MAX_EXPERIENCE_CHARS  = 500;
    private static final int MAX_PROJECT_CHARS     = 300;
    private static final int MAX_GITHUB_CHARS      = 600;

    private final ProfileService profileService;
    private final UserRepository userRepository;
    private final GitHubService gitHubService;
    private final GitHubGraphQLService gitHubGraphQLService;
    private final PromptLoader promptLoader;

    /**
     * Строит system prompt для assistant-чата.
     * Загружает шаблон из prompts/assistant_system_v1.txt
     * и дополняет данными пользователя.
     */
    public String buildAssistantSystemPrompt(Long userId) {
        String basePrompt = promptLoader.load("assistant_system_v1");
        String userContext = buildUserContextBlock(userId);
        return basePrompt + "\n\n" + userContext;
    }

    /**
     * Строит контекстный блок для встраивания в любой промпт.
     * Используется в generate-эндпоинтах (summary, project description и т.д.)
     */
    public String buildUserContextBlock(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        ProfileDto profile = profileService.getByUserId(userId);

        StringBuilder sb = new StringBuilder();
        sb.append("=== SYSTEM INFO ===\n");
        sb.append("Current Date: ").append(java.time.LocalDate.now().toString()).append("\n");
        sb.append("Note to AI: Use the Current Date to correctly calculate the user's current status (e.g. if their graduation date is in the past, they have graduated). Do not hallucinate or use outdated status like 'current student' if the current date is past their graduation date.\n\n");

        sb.append("=== USER PROFILE ===\n");
        sb.append("Name: ").append(orEmpty(profile.getFullName())).append("\n");
        sb.append("Headline: ").append(orEmpty(profile.getHeadline())).append("\n");
        sb.append("Plan: ").append(user.getPlan() != null ? user.getPlan().name() : "FREE").append("\n");
        sb.append("Summary: ").append(truncate(profile.getSummary(), MAX_SUMMARY_CHARS)).append("\n");
        sb.append("Location: ").append(orEmpty(profile.getLocation())).append("\n\n");

        if (profile.getExperience() != null && !profile.getExperience().isEmpty()) {
            sb.append("=== EXPERIENCE ===\n");
            profile.getExperience().forEach(e -> {
                sb.append("- ").append(e.getPosition()).append(" at ").append(e.getCompany())
                  .append(" (").append(e.getStartDate()).append(" — ")
                  .append(Boolean.TRUE.equals(e.getIsCurrent()) ? "Present" : e.getEndDate())
                  .append(")\n");
                if (e.getDescription() != null && !e.getDescription().isBlank()) {
                    sb.append("  ").append(truncate(e.getDescription(), MAX_EXPERIENCE_CHARS)).append("\n");
                }
            });
            sb.append("\n");
        }

        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            sb.append("=== SKILLS ===\n");
            profile.getSkills().forEach(s ->
                sb.append("- ").append(s.getName()).append(" (").append(s.getLevel()).append(")\n")
            );
            sb.append("\n");
        }

        if (profile.getProjects() != null && !profile.getProjects().isEmpty()) {
            sb.append("=== PROJECTS ===\n");
            profile.getProjects().forEach(p -> {
                sb.append("- ").append(p.getName()).append(": ")
                  .append(truncate(p.getDescription(), MAX_PROJECT_CHARS)).append("\n");
                if (p.getGithubUrl() != null && !p.getGithubUrl().isBlank()) {
                    sb.append("  GitHub: ").append(p.getGithubUrl()).append("\n");
                }
            });
            sb.append("\n");
        }

        // GitHub данные кэшируются отдельно — они медленные и меняются редко
        if (profile.getGithubUsername() != null && !profile.getGithubUsername().isBlank()) {
            sb.append("<github_data>\n");
            sb.append("  Username: ").append(profile.getGithubUsername()).append("\n");
            
            String githubData = fetchGithubCached(profile.getGithubUsername());
            sb.append("  ").append(truncate(githubData, MAX_GITHUB_CHARS).replace("\n", "\n  ")).append("\n");
            
            GitHubStatsDto stats = gitHubGraphQLService.fetchContributionsCached(
                userId, profile.getGithubUsername(), user.getGithubAccessToken()
            );
            
            if (stats != null) {
                sb.append("  contributions_last_90_days:\n");
                sb.append("    commits: ").append(stats.totalCommits()).append("\n");
                sb.append("    repositories_contributed: ").append(stats.totalRepositoriesContributed()).append("\n");
                sb.append("    total_contribution_events: ").append(stats.totalContributions()).append("\n");
                sb.append("    period: ").append(stats.from()).append(" to ").append(stats.to()).append("\n");
            } else {
                sb.append("  contributions: unavailable\n");
            }
            
            sb.append("</github_data>\n");
        }

        int estimatedTokens = sb.length() / 4;
        log.debug("[AiContextService] Built context for user {}: {} chars (~{} tokens)",
                userId, sb.length(), estimatedTokens);

        return sb.toString();
    }

    /**
     * GitHub данные кэшируются на 1 час.
     * TTL настраивается в CacheConfig через CaffeineSpec или Redis TTL.
     */
    @Cacheable(value = "github-context", key = "#username")
    public String fetchGithubCached(String username) {
        try {
            return gitHubService.fetchUserPublicRepos(username);
        } catch (Exception e) {
            log.warn("[AiContextService] Failed to fetch GitHub data for {}: {}", username, e.getMessage());
            return "GitHub data unavailable";
        }
    }

    private String truncate(String text, int max) {
        if (text == null || text.isBlank()) return "Not provided";
        return text.length() <= max ? text : text.substring(0, max) + "...";
    }

    private String orEmpty(String value) {
        return value != null ? value : "Not provided";
    }
}
