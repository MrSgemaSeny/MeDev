package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
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
        
        groqClient = new GroqClient(webClientBuilder, objectMapper, tokenAccountingService, "test-key", "http://test");
    }

    @Test
    void providerName_returnsGroq() {
        assertThat(groqClient.providerName()).isEqualTo("groq");
    }
}
