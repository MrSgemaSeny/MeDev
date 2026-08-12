package com.medev.modules.github.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.github.dto.GitHubStatsDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.web.reactive.function.client.WebClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GitHubGraphQLServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private GitHubGraphQLService gitHubGraphQLService;

    @BeforeEach
    void setUp() {
        // leniency for RedisTemplate mock
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void fetchContributionsCached_WhenCacheHit_ReturnsCachedData() throws Exception {
        Long userId = 1L;
        String login = "testuser";
        String token = "token";
        
        String cachedJson = "{\"totalCommits\":15,\"totalRepositoriesContributed\":5}";
        when(valueOperations.get("github:stats:" + userId)).thenReturn(cachedJson);
        
        GitHubStatsDto mockDto = new GitHubStatsDto(15, 5, 20, null, null);
        when(objectMapper.readValue(cachedJson, GitHubStatsDto.class)).thenReturn(mockDto);

        GitHubStatsDto result = gitHubGraphQLService.fetchContributionsCached(userId, login, token);

        assertNotNull(result);
        assertEquals(15, result.totalCommits());
        assertEquals(5, result.totalRepositoriesContributed());
        
        // Ensure webclient is not built (no API call)
        verify(webClientBuilder, never()).build();
    }

    @Test
    void fetchContributionsCached_WhenLoginOrTokenEmpty_ReturnsNull() {
        assertNull(gitHubGraphQLService.fetchContributionsCached(1L, null, "token"));
        assertNull(gitHubGraphQLService.fetchContributionsCached(1L, "", "token"));
    }
}
