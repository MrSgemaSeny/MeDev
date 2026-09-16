package com.medev.modules.tracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.service.LlmProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;
import org.springframework.data.redis.core.StringRedisTemplate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WebScraperServiceAdversarialTest {

    private WebScraperService trackerScraper;
    private com.medev.modules.ai.service.WebScraperService aiScraper;
    private UrlSecurityValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UrlSecurityValidator();
        StringRedisTemplate redisTemplate = Mockito.mock(StringRedisTemplate.class);
        LlmProvider llmProvider = Mockito.mock(LlmProvider.class);
        ObjectMapper objectMapper = new ObjectMapper();

        trackerScraper = new WebScraperService(redisTemplate, llmProvider, objectMapper, validator);
        aiScraper = new com.medev.modules.ai.service.WebScraperService(validator);
    }

    @ParameterizedTest(name = "SSRF attack: {0}")
    @ValueSource(strings = {
            "http://127.0.0.1:80",
            "http://0.0.0.0/",
            "http://[::1]/",
            "http://169.254.169.254/latest/meta-data/",
            "http://10.0.0.1/",
            "http://172.16.0.1/",
            "http://192.168.1.1/",
            "http://100.64.0.1/",
            "http://example.com:6379/",
            "http://example.com:22/",
            "http://localhost/admin",
            "http://backend.internal/secrets"
    })
    @DisplayName("Tracker WebScraperService: Never swallows IllegalArgumentException on SSRF attack")
    void testTrackerScraperThrowsOnSsrf(String maliciousUrl) {
        assertThatThrownBy(() -> trackerScraper.scrapeJobUrl(maliciousUrl))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest(name = "AI Scraper SSRF attack: {0}")
    @ValueSource(strings = {
            "http://127.0.0.1:80",
            "http://0.0.0.0/",
            "http://[::1]/",
            "http://169.254.169.254/latest/meta-data/",
            "http://10.0.0.1/",
            "http://172.16.0.1/",
            "http://192.168.1.1/",
            "http://100.64.0.1/",
            "http://example.com:6379/",
            "http://example.com:22/",
            "file:///etc/passwd",
            "gopher://127.0.0.1:70/"
    })
    @DisplayName("AI WebScraperService: Never swallows IllegalArgumentException on SSRF attack")
    void testAiScraperThrowsOnSsrf(String maliciousUrl) {
        assertThatThrownBy(() -> aiScraper.extractTextFromUrl(maliciousUrl))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
