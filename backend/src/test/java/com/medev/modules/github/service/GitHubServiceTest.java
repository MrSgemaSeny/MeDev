package com.medev.modules.github.service;

import com.medev.modules.profile.service.ProfileService;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.auth.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.util.Optional;

// Stub DTO classes because we don't have imports, but typically they are in similar packages
import com.medev.modules.github.dto.GitHubImportRequest;
import com.medev.modules.github.dto.GitHubProfileDto;
import com.medev.modules.github.dto.GitHubRepoDto;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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

    @InjectMocks
    @Spy
    private GitHubService gitHubService;




    
    @Test
    void importToProfile_happyPath() {
        Long userId = 1L;
        GitHubImportRequest request = new GitHubImportRequest();
        request.setToken("token");
        request.setSelectedRepoIds(List.of(100L));

        GitHubRepoDto repo = new GitHubRepoDto();
        repo.setId(100L);
        repo.setName("repo1");

        GitHubProfileDto profile = GitHubProfileDto.builder()
                .repos(List.of(repo))
                .languageStats(Map.of("Java", 100))
                .build();

        doReturn(profile).when(gitHubService).fetchAndParseProfile(userId);

        gitHubService.importToProfile(userId, request);

        verify(profileService).updateFromGitHub(userId, profile);
        verify(profileService).importProjects(userId, List.of(repo));
        verify(profileService).addSkillIfNotExists(userId, "Java", "Backend");
    }

    @Test
    void importToProfile_noSelectedRepos_onlyUpdatesProfile() {
        Long userId = 1L;
        GitHubImportRequest request = new GitHubImportRequest();
        request.setToken("token");
        request.setSelectedRepoIds(null);

        GitHubProfileDto profile = GitHubProfileDto.builder().build();

        doReturn(profile).when(gitHubService).fetchAndParseProfile(userId);

        gitHubService.importToProfile(userId, request);

        verify(profileService).updateFromGitHub(userId, profile);
        verify(profileService, never()).importProjects(any(), any());
    }

    @Test
    void importToProfile_nullLanguageStats_doesNotThrow() {
        Long userId = 1L;
        GitHubImportRequest request = new GitHubImportRequest();
        request.setToken("token");

        GitHubProfileDto profile = GitHubProfileDto.builder().languageStats(null).build();

        doReturn(profile).when(gitHubService).fetchAndParseProfile(userId);

        gitHubService.importToProfile(userId, request);

        verify(profileService).updateFromGitHub(userId, profile);
        verify(profileService, never()).addSkillIfNotExists(any(), any(), any());
    }
}
