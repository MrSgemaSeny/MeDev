package com.medev.shared.exception;

import com.medev.modules.ai.model.LlmException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleLlmException_rateLimited_returnsTooManyRequests() {
        LlmException ex = new LlmException(LlmException.Reason.RATE_LIMITED, "Groq limit reached");
        ResponseEntity<Map<String, Object>> response = handler.handleLlmException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo(429);
        assertThat(response.getBody().get("message").toString()).contains("лимит");
    }

    @Test
    void handleLlmException_providerUnavailable_returnsServiceUnavailable() {
        LlmException ex = new LlmException(LlmException.Reason.PROVIDER_UNAVAILABLE, "503 timeout");
        ResponseEntity<Map<String, Object>> response = handler.handleLlmException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo(503);
        assertThat(response.getBody().get("message").toString()).contains("перегружен или недоступен");
    }

    @Test
    void handleLlmException_invalidResponse_returnsBadGateway() {
        LlmException ex = new LlmException(LlmException.Reason.INVALID_RESPONSE, "bad json");
        ResponseEntity<Map<String, Object>> response = handler.handleLlmException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo(502);
        assertThat(response.getBody().get("message").toString()).contains("некорректный ответ");
    }

    @Test
    void handleIllegalArgument_returnsBadRequestWithMessage() {
        IllegalArgumentException ex = new IllegalArgumentException("Файл поврежден или не является корректным PDF");
        ResponseEntity<Map<String, Object>> response = handler.handleIllegalArgument(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo(400);
        assertThat(response.getBody().get("message")).isEqualTo("Файл поврежден или не является корректным PDF");
    }
}
