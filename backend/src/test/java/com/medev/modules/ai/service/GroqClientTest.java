package com.medev.modules.ai.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GroqClientTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private GroqClient groqClient;

    @BeforeEach
    void setUp() {
        groqClient = new GroqClient(webClientBuilder);
    }

    private void mockWebClientChain(Map<String, Object> responseMap) {
        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.header(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(responseMap));
    }

    @Test
    void sendChatCompletion_happyPath() {
        ReflectionTestUtils.setField(groqClient, "apiKey", "test-key");
        ReflectionTestUtils.setField(groqClient, "apiUrl", "http://test");

        Map<String, Object> responseMap = Map.of(
                "choices", List.of(
                        Map.of("message", Map.of("content", "Success"))
                )
        );
        mockWebClientChain(responseMap);

        String result = groqClient.sendChatCompletion("system", "user");

        assertThat(result).isEqualTo("Success");
    }

    @Test
    void sendChatCompletion_noApiKey_throwsIllegalState() {
        ReflectionTestUtils.setField(groqClient, "apiKey", null);

        assertThatThrownBy(() -> groqClient.sendChatCompletion("system", "user"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Groq API key is not configured");
    }

    @Test
    void sendChatCompletion_emptyChoices_throwsRuntime() {
        ReflectionTestUtils.setField(groqClient, "apiKey", "test-key");
        ReflectionTestUtils.setField(groqClient, "apiUrl", "http://test");

        Map<String, Object> responseMap = Map.of("choices", Collections.emptyList());
        mockWebClientChain(responseMap);

        assertThatThrownBy(() -> groqClient.sendChatCompletion("system", "user"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void sendChatCompletion_noChoicesKey_throwsRuntime() {
        ReflectionTestUtils.setField(groqClient, "apiKey", "test-key");
        ReflectionTestUtils.setField(groqClient, "apiUrl", "http://test");

        Map<String, Object> responseMap = Map.of();
        mockWebClientChain(responseMap);

        assertThatThrownBy(() -> groqClient.sendChatCompletion("system", "user"))
                .isInstanceOf(RuntimeException.class);
    }
}
