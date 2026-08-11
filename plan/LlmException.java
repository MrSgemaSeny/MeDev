package com.medev.modules.ai.model;

/**
 * Типизированные ошибки LLM-слоя.
 * Позволяет GlobalExceptionHandler обрабатывать их отдельно от RuntimeException.
 */
public class LlmException extends RuntimeException {

    public enum Reason {
        API_KEY_MISSING,      // ключ не настроен
        RATE_LIMITED,         // 429 от провайдера
        PROVIDER_UNAVAILABLE, // 5xx от провайдера
        INVALID_RESPONSE,     // ответ не прошёл валидацию схемы
        TIMEOUT,              // превышен timeout
        CIRCUIT_OPEN          // circuit breaker открыт
    }

    private final Reason reason;

    public LlmException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public LlmException(Reason reason, String message, Throwable cause) {
        super(message, cause);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }

    public boolean isRetryable() {
        return reason == Reason.RATE_LIMITED || reason == Reason.PROVIDER_UNAVAILABLE || reason == Reason.TIMEOUT;
    }
}
