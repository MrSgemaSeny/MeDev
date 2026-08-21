package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GroqClientTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private WebClient webClient;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private TokenAccountingService tokenAccountingService;

    private GroqClient groqClient;

    @BeforeEach
    void setUp() {
        when(webClientBuilder.clientConnector(org.mockito.ArgumentMatchers.any())).thenReturn(webClientBuilder);
        when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.defaultHeader(anyString(), anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);
        
        groqClient = new GroqClient(webClientBuilder, objectMapper, tokenAccountingService, "test-key", "http://test", "openai/gpt-oss-20b");
    }

    @Test
    void providerName_returnsGroq() {
        assertThat(groqClient.providerName()).isEqualTo("groq");
    }

    @Test
    void maxTokens_isConfiguredTo4096() throws Exception {
        Field field = GroqClient.class.getDeclaredField("MAX_TOKENS");
        field.setAccessible(true);
        int maxTokens = (int) field.get(null);
        assertThat(maxTokens).isEqualTo(4096);
    }

    @Test
    void extractJson_pureJsonObject() {
        String input = "{\"score\": 85, \"feedback\": \"Good match\"}";
        String result = GroqClient.extractJson(input);
        assertThat(result).isEqualTo("{\"score\": 85, \"feedback\": \"Good match\"}");
    }

    @Test
    void extractJson_markdownFencesWithJsonTag() {
        String input = "```json\n{\n  \"score\": 90,\n  \"feedback\": \"Great fit\"\n}\n```";
        String result = GroqClient.extractJson(input);
        assertThat(result).isEqualTo("{\n  \"score\": 90,\n  \"feedback\": \"Great fit\"\n}");
    }

    @Test
    void extractJson_markdownFencesWithoutJsonTag() {
        String input = "```\n{\"coverLetter\": \"Dear Hiring Manager...\"}\n```";
        String result = GroqClient.extractJson(input);
        assertThat(result).isEqualTo("{\"coverLetter\": \"Dear Hiring Manager...\"}");
    }

    @Test
    void extractJson_conversationalPreambleAndPostscript() {
        String input = "Sure, here is your generated cover letter in JSON format:\n\n```json\n{\"coverLetter\": \"Hello Team\"}\n```\n\nHope this helps with your job search!";
        String result = GroqClient.extractJson(input);
        assertThat(result).isEqualTo("{\"coverLetter\": \"Hello Team\"}");
    }

    @Test
    void extractJson_preambleWithoutCodeBlocks() {
        String input = "Here is the result: {\"score\": 95, \"feedback\": \"Strong skills\"} - Best regards!";
        String result = GroqClient.extractJson(input);
        assertThat(result).isEqualTo("{\"score\": 95, \"feedback\": \"Strong skills\"}");
    }

    @Test
    void extractJson_jsonArray() {
        String input = "Here are the suggestions:\n```json\n[{\"suggestion\": \"Add Docker\"}, {\"suggestion\": \"Add Redis\"}]\n```";
        String result = GroqClient.extractJson(input);
        assertThat(result).isEqualTo("[{\"suggestion\": \"Add Docker\"}, {\"suggestion\": \"Add Redis\"}]");
    }

    @Test
    void extractJson_nullAndBlankHandling() {
        assertThat(GroqClient.extractJson(null)).isEqualTo("{}");
        assertThat(GroqClient.extractJson("   ")).isEqualTo("{}");
    }
}
