package com.medev.modules.tracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.service.LlmProvider;
import com.medev.modules.tracker.dto.CreateJobApplicationRequest;
import com.medev.modules.tracker.entity.ApplicationStatus;
import com.medev.shared.exception.TooManyRequestsException;
import org.jsoup.nodes.Document;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebScraperDecompositionTest {

    @Mock
    private UrlSecurityValidator urlSecurityValidator;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private LlmProvider llmProvider;

    @Mock
    private GenericPageFetcher genericPageFetcher;

    @Mock
    private HhVacancyClient hhVacancyClient;

    @Mock
    private AiJobExtractor aiJobExtractor;

    private ObjectMapper objectMapper = new ObjectMapper();
    private ScrapeRateLimiter scrapeRateLimiter;
    private WebScraperService coordinator;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        scrapeRateLimiter = new ScrapeRateLimiter(redisTemplate);
        coordinator = new WebScraperService(
                urlSecurityValidator,
                scrapeRateLimiter,
                hhVacancyClient,
                genericPageFetcher,
                aiJobExtractor
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("HhVacancyClient: correctly detects HH URLs and extracts vacancy ID")
    void testHhVacancyClient_matching() {
        HhVacancyClient client = new HhVacancyClient(objectMapper);

        assertThat(client.isHhUrl("https://hh.ru/vacancy/12345678")).isTrue();
        assertThat(client.isHhUrl("https://hh.kz/vacancy/98765432?query=java")).isTrue();
        assertThat(client.isHhUrl("https://headhunter.ru/vacancy/111222")).isTrue();
        assertThat(client.isHhUrl("https://google.com/jobs/123")).isFalse();
        assertThat(client.isHhUrl(null)).isFalse();

        assertThat(client.extractVacancyId("https://hh.ru/vacancy/12345678")).isEqualTo("12345678");
        assertThat(client.extractVacancyId("https://hh.kz/vacancy/98765432?query=java")).isEqualTo("98765432");
        assertThat(client.extractVacancyId("https://google.com")).isNull();
    }

    @Test
    @DisplayName("ScrapeRateLimiter: throws TooManyRequestsException when per-domain limit exceeded")
    void testScrapeRateLimiter_domainLimitExceeded() {
        SecurityContextHolder.clearContext();
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(startsWith("rate:scrape:domain:evil-domain.com"))).thenReturn(61L);

        assertThatThrownBy(() -> scrapeRateLimiter.checkRateLimit("https://evil-domain.com/job/123"))
                .isInstanceOf(TooManyRequestsException.class)
                .hasMessageContaining("evil-domain.com");
    }

    @Test
    @DisplayName("ScrapeRateLimiter: handles schemeless URLs properly for per-domain rate limiting")
    void testScrapeRateLimiter_domainLimitExceeded_schemelessUrl() {
        SecurityContextHolder.clearContext();
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(startsWith("rate:scrape:domain:hh.ru"))).thenReturn(61L);

        assertThatThrownBy(() -> scrapeRateLimiter.checkRateLimit("hh.ru/vacancy/12345678"))
                .isInstanceOf(TooManyRequestsException.class)
                .hasMessageContaining("hh.ru");
    }

    @Test
    @DisplayName("ScrapeRateLimiter: throws TooManyRequestsException when per-user limit exceeded")
    void testScrapeRateLimiter_userLimitExceeded() {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(42L, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("rate:scrape:user:42")).thenReturn(21L);

        assertThatThrownBy(() -> scrapeRateLimiter.checkRateLimit("https://example.com/job/1"))
                .isInstanceOf(TooManyRequestsException.class)
                .hasMessageContaining("Слишком много запросов на парсинг");
    }

    @Test
    @DisplayName("ScrapeRateLimiter: gracefully handles Redis DataAccessException without failing")
    void testScrapeRateLimiter_redisDataAccessExceptionHandledGracefully() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenThrow(new QueryTimeoutException("Redis connection timed out"));

        // Should catch DataAccessException and log warning, not rethrow
        scrapeRateLimiter.checkRateLimit("https://example.com/job/1");
    }

    @Test
    @DisplayName("ScrapeRateLimiter: extractDomain handles various URL formats, schemeless URLs, and invalid inputs")
    void testScrapeRateLimiter_extractDomain() {
        assertThat(scrapeRateLimiter.extractDomain("https://hh.ru/vacancy/123")).isEqualTo("hh.ru");
        assertThat(scrapeRateLimiter.extractDomain("http://SUB.DOMAIN.COM:8080/path?q=1")).isEqualTo("sub.domain.com");
        assertThat(scrapeRateLimiter.extractDomain("hh.kz/vacancy/999")).isEqualTo("hh.kz");
        assertThat(scrapeRateLimiter.extractDomain("  headhunter.ru/job  ")).isEqualTo("headhunter.ru");
        assertThat(scrapeRateLimiter.extractDomain("")).isNull();
        assertThat(scrapeRateLimiter.extractDomain("   ")).isNull();
        assertThat(scrapeRateLimiter.extractDomain(null)).isNull();
    }

    @Test
    @DisplayName("GenericPageFetcher: rethrows IllegalArgumentException on SSRF without swallowing")
    void testGenericPageFetcher_rethrowsSecurityException() {
        doThrow(new IllegalArgumentException("Private Class A address blocked: 10.0.0.1"))
                .when(urlSecurityValidator).validateUrl("http://10.0.0.1/");

        GenericPageFetcher fetcher = new GenericPageFetcher(urlSecurityValidator);

        assertThatThrownBy(() -> fetcher.fetchDocument("http://10.0.0.1/"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Private Class A address blocked");
    }

    @Test
    @DisplayName("Coordinator: delegates to HhVacancyClient when HH URL is provided")
    void testCoordinator_delegatesToHhVacancyClient() {
        String hhUrl = "https://hh.ru/vacancy/12345678";
        when(hhVacancyClient.isHhUrl(hhUrl)).thenReturn(true);
        when(hhVacancyClient.extractVacancyId(hhUrl)).thenReturn("12345678");
        doAnswer(invocation -> {
            CreateJobApplicationRequest req = invocation.getArgument(1);
            req.setRole("Senior Java Engineer");
            req.setCompanyName("Kaspi Bank");
            return true;
        }).when(hhVacancyClient).extractFromApi(eq("12345678"), any());

        CreateJobApplicationRequest result = coordinator.scrapeJobUrl(hhUrl);

        verify(urlSecurityValidator).validateUrl(hhUrl);
        assertThat(result.getRole()).isEqualTo("Senior Java Engineer");
        assertThat(result.getCompanyName()).isEqualTo("Kaspi Bank");
        verifyNoInteractions(genericPageFetcher);
        verifyNoInteractions(aiJobExtractor);
    }

    @Test
    @DisplayName("Coordinator: falls back to GenericPageFetcher and AiJobExtractor when DOM parsing yields no fields")
    void testCoordinator_fallsBackToAiJobExtractor() {
        String genericUrl = "https://generic-jobs.kz/vacancy/555";
        when(hhVacancyClient.isHhUrl(genericUrl)).thenReturn(false);

        Document doc = org.jsoup.Jsoup.parse("<html><body>We are looking for a Kotlin Backend Engineer at Choco</body></html>");
        when(genericPageFetcher.fetchDocument(genericUrl)).thenReturn(doc);

        doAnswer(invocation -> {
            CreateJobApplicationRequest req = invocation.getArgument(1);
            req.setRole("Kotlin Backend Engineer");
            req.setCompanyName("Choco");
            return null;
        }).when(aiJobExtractor).extractWithAi(anyString(), any());

        CreateJobApplicationRequest result = coordinator.scrapeJobUrl(genericUrl);

        verify(urlSecurityValidator).validateUrl(genericUrl);
        verify(genericPageFetcher).fetchDocument(genericUrl);
        verify(aiJobExtractor).extractWithAi(contains("Kotlin Backend Engineer"), any());
        assertThat(result.getRole()).isEqualTo("Kotlin Backend Engineer");
        assertThat(result.getCompanyName()).isEqualTo("Choco");
    }

    @Test
    @DisplayName("Coordinator: returns empty wishlist template on null or blank URL")
    void testCoordinator_emptyUrl() {
        CreateJobApplicationRequest result = coordinator.scrapeJobUrl("   ");
        assertThat(result.getStatus()).isEqualTo(ApplicationStatus.WISHLIST);
        assertThat(result.getRole()).isNull();
        assertThat(result.getCompanyName()).isNull();
        verifyNoInteractions(urlSecurityValidator);
    }
}
