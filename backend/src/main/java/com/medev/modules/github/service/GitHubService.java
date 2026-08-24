package com.medev.modules.github.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.github.dto.GitHubImportRequest;
import com.medev.modules.github.dto.GitHubProfileDto;
import com.medev.modules.github.dto.GitHubRepoDto;
import com.medev.modules.github.dto.GitHubUserDto;
import com.medev.modules.github.entity.GithubSnapshot;
import com.medev.modules.github.entity.GithubSnapshotId;
import com.medev.modules.github.repository.GithubSnapshotRepository;
import com.medev.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubService {

    private final WebClient.Builder webClientBuilder;
    private final ProfileService profileService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;
    private final GithubSnapshotRepository snapshotRepository;
    private final GitHubReadmeParser readmeParser;
    private final ObjectMapper objectMapper;

    private static final String GITHUB_API = "https://api.github.com";
    private static final Duration CACHE_TTL = Duration.ofHours(1);

    @Transactional
    public GitHubProfileDto fetchAndParseProfile(Long userId) {
        User userRecord = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String githubToken = userRecord.getGithubAccessToken();
        if (githubToken == null || githubToken.isEmpty()) {
            throw new RuntimeException("GitHub account is not connected.");
        }

        WebClient webClient = webClientBuilder.baseUrl(GITHUB_API)
                .defaultHeader("Authorization", "token " + githubToken)
                .build();

        try {
            // 1. Fetch User Data
            GitHubUserDto user = webClient.get().uri("/user")
                    .retrieve().bodyToMono(GitHubUserDto.class).timeout(Duration.ofSeconds(10)).block();

            // 2. Fetch All Repos
            List<GitHubRepoDto> allRepos = webClient.get()
                    .uri("/user/repos?sort=updated&per_page=100")
                    .retrieve().bodyToFlux(GitHubRepoDto.class).timeout(Duration.ofSeconds(15)).collectList().block();

            if (allRepos == null) allRepos = new ArrayList<>();

            // Scoring and sorting
            List<GitHubRepoDto> scoredRepos = allRepos.stream()
                    .sorted((r1, r2) -> Integer.compare(GitHubRepoScorer.calculateScore(r2), GitHubRepoScorer.calculateScore(r1)))
                    .collect(Collectors.toList());

            List<GitHubRepoDto> top10Repos = scoredRepos.stream().limit(10).collect(Collectors.toList());
            List<GitHubRepoDto> top5ReposByWeight = top10Repos.stream()
                    .sorted((r1, r2) -> Integer.compare(r2.getSize() != null ? r2.getSize() : 0, r1.getSize() != null ? r1.getSize() : 0))
                    .limit(5).collect(Collectors.toList());

            // 3. Parallel fetch languages for top 10
            Mono<Map<String, Integer>> languagesMono = Flux.fromIterable(top10Repos)
                    .flatMap(repo -> {
                        String repoPath = repo.getRepoPath(user != null ? user.getLogin() : null);
                        return webClient.get()
                                .uri("/repos/" + repoPath + "/languages")
                                .retrieve()
                                .bodyToMono(new ParameterizedTypeReference<Map<String, Integer>>() {})
                                .onErrorResume(e -> Mono.just(new HashMap<>()));
                    }, 5)
                    .reduce(new HashMap<String, Integer>(), (acc, map) -> {
                        map.forEach((k, v) -> acc.merge(k, v, Integer::sum));
                        return acc;
                    });

            // 4. Parallel fetch READMEs for top 5 to extract tech stack
            Mono<List<String>> techStackMono = Flux.fromIterable(top5ReposByWeight)
                    .flatMap(repo -> {
                        String repoPath = repo.getRepoPath(user != null ? user.getLogin() : null);
                        return webClient.get()
                                .uri("/repos/" + repoPath + "/readme")
                                .header("Accept", "application/vnd.github.v3.raw")
                                .retrieve()
                                .bodyToMono(String.class)
                                .onErrorResume(e -> Mono.just(""))
                                .map(readmeParser::extractTechnologies);
                    }, 5)
                    .reduce(new ArrayList<String>(), (acc, list) -> {
                        acc.addAll(list);
                        return acc;
                    })
                    .map(list -> list.stream().distinct().collect(Collectors.toList()));

            // 5. Parallel fetch organizations
            Mono<List<String>> orgsMono = webClient.get().uri("/user/orgs")
                    .retrieve()
                    .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .map(m -> (String) m.get("login"))
                    .collectList()
                    .onErrorResume(e -> Mono.just(new ArrayList<>()));

            // 6. Zip all together
            GitHubProfileDto result = Mono.zip(languagesMono, techStackMono, orgsMono)
                    .map(tuple -> GitHubProfileDto.builder()
                            .username(user != null ? user.getLogin() : null)
                            .name(user != null ? user.getName() : null)
                            .avatarUrl(user != null ? user.getAvatarUrl() : null)
                            .bio(user != null ? user.getBio() : null)
                            .location(user != null ? user.getLocation() : null)
                            .publicRepos(user != null ? user.getPublicRepos() : 0)
                            .repos(top10Repos)
                            .languageStats(tuple.getT1())
                            .detectedTechnologies(tuple.getT2())
                            .organizations(tuple.getT3())
                            .build()
                    ).timeout(Duration.ofSeconds(20)).block();

            // 7. Save Snapshot
            if (result != null) {
                try {
                    String json = objectMapper.writeValueAsString(result);
                    GithubSnapshot snapshot = GithubSnapshot.builder()
                            .id(new GithubSnapshotId(userId, LocalDateTime.now()))
                            .user(userRecord)
                            .rawJson(json)
                            .build();
                    snapshotRepository.save(snapshot);
                } catch (JsonProcessingException e) {
                    log.error("Failed to serialize GitHub profile", e);
                }
            }

            return result;
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Failed to fetch data from GitHub API: " + e.getMessage());
        }
    }

    public String fetchUserPublicRepos(String username) {
        if (username == null || username.isBlank() || !username.matches("^[a-zA-Z0-9_-]+$")) return "";

        String cacheKey = "github:public_repos:" + username;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) return (String) cached;

        WebClient webClient = webClientBuilder.baseUrl(GITHUB_API).build();

        // Note: this method is mostly used by AiContextService without userId context.
        // If we want it to fetch private repos, we would need to pass userId and extract the token.
        // The original method signature doesn't pass userId. For now, this fallback remains public only.
        
        try {
            List<GitHubRepoDto> repos = webClient.get()
                    .uri("/users/" + username + "/repos?sort=updated&per_page=10")
                    .retrieve()
                    .bodyToFlux(GitHubRepoDto.class)
                    .timeout(Duration.ofSeconds(10))
                    .collectList()
                    .block();

            if (repos == null || repos.isEmpty()) return "";

            StringBuilder sb = new StringBuilder();
            sb.append("Публичные репозитории GitHub (последние 10 обновленных):\n");
            for (GitHubRepoDto repo : repos) {
                String displayName = repo.getFullName() != null && !repo.getFullName().isBlank()
                        ? repo.getFullName()
                        : repo.getName();
                sb.append("- ").append(displayName);
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
                    profileService.addSkillIfNotExists(userId, lang, "Language")
            );
        }
        
        if (github.getDetectedTechnologies() != null) {
            github.getDetectedTechnologies().forEach(tech -> 
                    profileService.addSkillIfNotExists(userId, tech, "Technology")
            );
        }
        
        if (github.getOrganizations() != null && !github.getOrganizations().isEmpty()) {
            profileService.importOrganizationsAsExperience(userId, github.getOrganizations());
        }
        
        if (github.getRepos() != null) {
            java.util.Map<String, java.time.LocalDate> oldestLangDate = new java.util.HashMap<>();
            for (GitHubRepoDto repo : github.getRepos()) {
                if (repo.getLanguage() != null && repo.getCreatedAt() != null) {
                    try {
                        java.time.LocalDate repoDate = java.time.OffsetDateTime.parse(repo.getCreatedAt()).toLocalDate();
                        java.time.LocalDate currentOldest = oldestLangDate.get(repo.getLanguage());
                        if (currentOldest == null || repoDate.isBefore(currentOldest)) {
                            oldestLangDate.put(repo.getLanguage(), repoDate);
                        }
                    } catch (Exception e) {}
                }
            }
            oldestLangDate.forEach((lang, date) -> {
                profileService.importLanguageExperience(userId, lang, date);
            });
        }
    }
}
