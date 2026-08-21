package com.medev.modules.github.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.github.dto.GitHubImportRequest;
import com.medev.modules.github.dto.GitHubProfileDto;
import com.medev.modules.github.dto.GitHubRepoDto;
import com.medev.modules.github.repository.GithubSnapshotRepository;
import com.medev.modules.profile.service.ProfileService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GitHubServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private ProfileService profileService;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GithubSnapshotRepository snapshotRepository;

    @Mock
    private GitHubReadmeParser readmeParser;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    @Spy
    private GitHubService gitHubService;

    @Test
    @DisplayName("importToProfile imports selected org and private repositories successfully")
    void importToProfile_happyPath_withOrgAndPrivateRepos() {
        Long userId = 1L;
        GitHubImportRequest request = new GitHubImportRequest();
        request.setToken("dummy_token");
        request.setSelectedRepoIds(List.of(100L, 200L));

        GitHubRepoDto personalRepo = GitHubRepoDto.builder()
                .id(100L)
                .name("personal-app")
                .fullName("johndoe/personal-app")
                .isPrivate(false)
                .htmlUrl("https://github.com/johndoe/personal-app")
                .language("TypeScript")
                .createdAt("2022-01-15T10:00:00Z")
                .build();

        GitHubRepoDto orgPrivateRepo = GitHubRepoDto.builder()
                .id(200L)
                .name("internal-platform")
                .fullName("acme-corp/internal-platform")
                .isPrivate(true)
                .htmlUrl("https://github.com/acme-corp/internal-platform")
                .language("Java")
                .createdAt("2021-06-01T10:00:00Z")
                .build();

        GitHubProfileDto profile = GitHubProfileDto.builder()
                .username("johndoe")
                .repos(List.of(personalRepo, orgPrivateRepo))
                .languageStats(Map.of("Java", 50000, "TypeScript", 30000))
                .detectedTechnologies(List.of("Spring Boot", "React", "Docker"))
                .organizations(List.of("acme-corp"))
                .build();

        doReturn(profile).when(gitHubService).fetchAndParseProfile(userId);

        gitHubService.importToProfile(userId, request);

        verify(profileService).updateFromGitHub(userId, profile);
        verify(profileService).importProjects(userId, List.of(personalRepo, orgPrivateRepo));
        verify(profileService).addSkillIfNotExists(userId, "Java", "Language");
        verify(profileService).addSkillIfNotExists(userId, "TypeScript", "Language");
        verify(profileService).addSkillIfNotExists(userId, "Spring Boot", "Technology");
        verify(profileService).addSkillIfNotExists(userId, "React", "Technology");
        verify(profileService).addSkillIfNotExists(userId, "Docker", "Technology");
        verify(profileService).importOrganizationsAsExperience(userId, List.of("acme-corp"));
        verify(profileService).importLanguageExperience(userId, "Java", LocalDate.of(2021, 6, 1));
        verify(profileService).importLanguageExperience(userId, "TypeScript", LocalDate.of(2022, 1, 15));
    }

    @Test
    @DisplayName("importToProfile with no selected repos only updates profile and skills")
    void importToProfile_noSelectedRepos_onlyUpdatesProfile() {
        Long userId = 1L;
        GitHubImportRequest request = new GitHubImportRequest();
        request.setToken("token");
        request.setSelectedRepoIds(null);

        GitHubProfileDto profile = GitHubProfileDto.builder()
                .username("janedoe")
                .languageStats(Map.of("Go", 2000))
                .build();

        doReturn(profile).when(gitHubService).fetchAndParseProfile(userId);

        gitHubService.importToProfile(userId, request);

        verify(profileService).updateFromGitHub(userId, profile);
        verify(profileService, never()).importProjects(any(), any());
        verify(profileService).addSkillIfNotExists(userId, "Go", "Language");
    }

    @Test
    @DisplayName("importToProfile handles null languageStats and tech stack gracefully without throwing")
    void importToProfile_nullFields_doesNotThrow() {
        Long userId = 1L;
        GitHubImportRequest request = new GitHubImportRequest();
        request.setToken("token");

        GitHubProfileDto profile = GitHubProfileDto.builder()
                .languageStats(null)
                .detectedTechnologies(null)
                .organizations(null)
                .repos(null)
                .build();

        doReturn(profile).when(gitHubService).fetchAndParseProfile(userId);

        gitHubService.importToProfile(userId, request);

        verify(profileService).updateFromGitHub(userId, profile);
        verify(profileService, never()).addSkillIfNotExists(any(), any(), any());
        verify(profileService, never()).importOrganizationsAsExperience(any(), any());
    }

    @Test
    @DisplayName("fetchAndParseProfile throws when user is not found in database")
    void fetchAndParseProfile_userNotFound_throwsException() {
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gitHubService.fetchAndParseProfile(userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("fetchAndParseProfile throws when user has not connected GitHub (no token)")
    void fetchAndParseProfile_missingToken_throwsException() {
        Long userId = 2L;
        User user = User.builder().id(userId).email("user@example.com").githubAccessToken(null).build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> gitHubService.fetchAndParseProfile(userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("GitHub account is not connected");
    }

    @Test
    @DisplayName("fetchUserPublicRepos returns cached result when available in Redis")
    void fetchUserPublicRepos_cacheHit_returnsCachedString() {
        String username = "torvalds";
        String cachedResponse = "Публичные репозитории GitHub:\n- linux [C]\n";
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("github:public_repos:" + username)).thenReturn(cachedResponse);

        String result = gitHubService.fetchUserPublicRepos(username);

        assertThat(result).isEqualTo(cachedResponse);
        verify(webClientBuilder, never()).baseUrl(anyString());
    }

    @Test
    @DisplayName("fetchUserPublicRepos rejects invalid username characters to prevent injection")
    void fetchUserPublicRepos_invalidUsername_returnsEmpty() {
        assertThat(gitHubService.fetchUserPublicRepos(null)).isEmpty();
        assertThat(gitHubService.fetchUserPublicRepos("")).isEmpty();
        assertThat(gitHubService.fetchUserPublicRepos("invalid username with spaces")).isEmpty();
        assertThat(gitHubService.fetchUserPublicRepos("user/../attack")).isEmpty();
    }
}

