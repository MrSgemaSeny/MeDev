package com.medev.modules.github.service;

import com.medev.modules.github.dto.GitHubImportRequest;
import com.medev.modules.github.dto.GitHubProfileDto;
import com.medev.modules.github.dto.GitHubRepoDto;
import com.medev.modules.github.dto.GitHubUserDto;
import com.medev.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.auth.entity.User;

@Service
@RequiredArgsConstructor
public class GitHubService {

    private final WebClient.Builder webClientBuilder;
    private final ProfileService profileService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;

    private static final String GITHUB_API = "https://api.github.com";
    private static final Duration CACHE_TTL = Duration.ofHours(1);

    public GitHubProfileDto fetchAndParseProfile(Long userId) {
        User userRecord = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String githubToken = userRecord.getGithubAccessToken();
        if (githubToken == null || githubToken.isEmpty()) {
            throw new RuntimeException("GitHub account is not connected.");
        }

        WebClient webClient = webClientBuilder.baseUrl(GITHUB_API).build();

        try {
            GitHubUserDto user = webClient.get()
                    .uri("/user")
                    .header("Authorization", "token " + githubToken)
                    .retrieve()
                    .bodyToMono(GitHubUserDto.class)
                    .block();

            List<GitHubRepoDto> repos = webClient.get()
                    .uri("/user/repos?sort=updated&per_page=100")
                    .header("Authorization", "token " + githubToken)
                    .retrieve()
                    .bodyToFlux(GitHubRepoDto.class)
                    .collectList()
                    .block();

            Map<String, Integer> languageStats = null;
            if (repos != null) {
                languageStats = repos.stream()
                        .filter(r -> r.getLanguage() != null)
                        .collect(Collectors.groupingBy(
                                GitHubRepoDto::getLanguage,
                                Collectors.summingInt(r -> 1)
                        ));
            }

            GitHubProfileDto result = GitHubProfileDto.builder()
                    .username(user != null ? user.getLogin() : null)
                    .name(user != null ? user.getName() : null)
                    .avatarUrl(user != null ? user.getAvatarUrl() : null)
                    .bio(user != null ? user.getBio() : null)
                    .location(user != null ? user.getLocation() : null)
                    .publicRepos(user != null ? user.getPublicRepos() : 0)
                    .repos(repos)
                    .languageStats(languageStats)
                    .build();

            return result;
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Failed to fetch data from GitHub API: " + e.getMessage());
        }
    }

    public String fetchUserPublicRepos(String username) {
        if (username == null || username.isEmpty()) return "";

        String cacheKey = "github:public_repos:" + username;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) return (String) cached;

        WebClient webClient = webClientBuilder.baseUrl(GITHUB_API).build();

        try {
            List<GitHubRepoDto> repos = webClient.get()
                    .uri("/users/" + username + "/repos?sort=updated&per_page=10")
                    .retrieve()
                    .bodyToFlux(GitHubRepoDto.class)
                    .collectList()
                    .block();

            if (repos == null || repos.isEmpty()) return "";

            StringBuilder sb = new StringBuilder();
            sb.append("Публичные репозитории GitHub (последние 10 обновленных):\n");
            for (GitHubRepoDto repo : repos) {
                sb.append("- ").append(repo.getName());
                if (repo.getLanguage() != null) sb.append(" [").append(repo.getLanguage()).append("]");
                if (repo.getDescription() != null) sb.append(": ").append(repo.getDescription());
                sb.append("\n");
            }

            String result = sb.toString();
            redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL);
            return result;
        } catch (WebClientResponseException e) {
            return "Не удалось получить репозитории (Rate Limit или ошибка GitHub API).";
        }
    }

    @Transactional
    public void importToProfile(Long userId, GitHubImportRequest request) {
        GitHubProfileDto github = fetchAndParseProfile(userId);

        profileService.updateFromGitHub(userId, github);

        if (request.getSelectedRepoIds() != null && github.getRepos() != null) {
            List<GitHubRepoDto> selectedRepos = github.getRepos().stream()
                    .filter(r -> request.getSelectedRepoIds().contains(r.getId()))
                    .toList();
            profileService.importProjects(userId, selectedRepos);
        }

        if (github.getLanguageStats() != null) {
            github.getLanguageStats().forEach((lang, count) ->
                    profileService.addSkillIfNotExists(userId, lang, "Backend")
            );
        }
    }
}
