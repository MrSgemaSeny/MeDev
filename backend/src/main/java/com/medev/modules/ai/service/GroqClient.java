package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.model.LlmException;
import com.medev.modules.ai.model.LlmException.Reason;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.util.retry.Retry;
import io.netty.resolver.DefaultAddressResolverGroup;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.codec.ServerSentEvent;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GroqClient implements LlmProvider {

    private static final int MAX_TOKENS = 2048;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final CircuitBreaker circuitBreaker;
    private final TokenAccountingService tokenAccountingService;
    private final String model;

    public GroqClient(
            org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder,
            com.fasterxml.jackson.databind.ObjectMapper objectMapper,
            TokenAccountingService tokenAccountingService,
            @org.springframework.beans.factory.annotation.Value("${groq.api-key}") String apiKey,
            @org.springframework.beans.factory.annotation.Value("${groq.api-url}") String apiUrl,
            @org.springframework.beans.factory.annotation.Value("${groq.model:llama-3.3-70b-versatile}") String model
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("[GroqClient] GROQ_API_KEY is not configured — AI features will fail at runtime");
        }

        this.model = (model == null || model.isBlank()) ? "llama-3.3-70b-versatile" : model;

        HttpClient httpClient = HttpClient.create()
                .resolver(DefaultAddressResolverGroup.INSTANCE);

        this.webClient = webClientBuilder
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                // connect timeout отдельно — через HttpClient в конфиге WebClient bean
                .build();

        this.objectMapper = objectMapper;
        this.tokenAccountingService = tokenAccountingService;

        // Circuit breaker: открывается после 5 ошибок подряд,
        // остаётся открытым 30 секунд, затем пускает 1 probe-запрос.
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .slidingWindowSize(10)
                .waitDurationInOpenState(Duration.ofSeconds(60))
                .permittedNumberOfCallsInHalfOpenState(1)
                .recordExceptions(LlmException.class, WebClientResponseException.class)
                .build();
        this.circuitBreaker = CircuitBreaker.of("groq", config);

        this.circuitBreaker.getEventPublisher()
                .onStateTransition(e ->
                    log.warn("[GroqClient] Circuit breaker transition: {}", e.getStateTransition()));
    }

    // ─────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────

    @Override
    public Flux<String> streamCompletion(List<Map<String, String>> messages) {
        Map<String, Object> body = Map.of(
                "model", this.model,
                "messages", messages,
                "temperature", 0.7,
                "max_tokens", MAX_TOKENS,
                "stream", true
        );

        return webClient.post()
                .bodyValue(body)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, resp -> resp.bodyToMono(String.class)
                        .flatMap(err -> Mono.error(handle4xx(resp.statusCode().value(), err))))
                .onStatus(HttpStatusCode::is5xxServerError, resp ->
                        Mono.error(new LlmException(Reason.PROVIDER_UNAVAILABLE, "Groq 5xx")))
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                .timeout(Duration.ofSeconds(90),
                        Flux.error(new LlmException(Reason.TIMEOUT, "Stream timeout after 90s")))
                .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
                .retryWhen(retrySpec())
                .mapNotNull(sse -> extractStreamChunk(sse.data()))
                .filter(s -> !s.isEmpty())
                .takeUntil(chunk -> "[DONE]".equals(chunk))
                .filter(chunk -> !"[DONE]".equals(chunk))
                .onErrorMap(this::wrapIfNeeded);
    }

    @Override
    public String structuredCompletion(String systemPrompt, String userMessage) {
        Long currentUserId = null;
        try {
            currentUserId = com.medev.shared.security.SecurityUtils.getCurrentUserId();
        } catch (Exception e) {
            log.warn("No user context for Token Accounting");
        }
        final Long userId = currentUserId;

        Map<String, Object> body = Map.of(
                "model", this.model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user",   "content", userMessage)
                ),
                "temperature", 0.1,     // низкая температура = детерминированный JSON
                "max_tokens", MAX_TOKENS,
                "response_format", Map.of("type", "json_object")
        );

        String raw = webClient.post()
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, resp -> resp.bodyToMono(String.class)
                        .flatMap(err -> Mono.error(handle4xx(resp.statusCode().value(), err))))
                .onStatus(HttpStatusCode::is5xxServerError, resp ->
                        Mono.error(new LlmException(Reason.PROVIDER_UNAVAILABLE, "Groq 5xx")))
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(90),
                        Mono.error(new LlmException(Reason.TIMEOUT, "Structured completion timeout after 90s")))
                .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
                .retryWhen(retrySpec())
                .map(response -> extractContentAndRecordUsage(response, userId, "/v1/ai/generate"))
                .onErrorMap(this::wrapIfNeeded)
                // block() здесь оправдан: structured completion используется
                // только в AiAnalysisService, который вызывается из @PostMapping (thread-per-request)
                .block();

        return cleanAndValidateJson(raw);
    }

    @Override
    public String providerName() {
        return "groq";
    }

    // ─────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────

    /**
     * Retry только на retriable ошибки: 429 и 5xx.
     * Exponential backoff: 1s → 2s → 4s.
     * НЕ ретраит 400/401/422 — это программные ошибки.
     */
    private Retry retrySpec() {
        return Retry.backoff(4, Duration.ofSeconds(4))
                .maxBackoff(Duration.ofSeconds(20))
                .filter(e -> e instanceof LlmException && ((LlmException) e).isRetryable())
                .doBeforeRetry(signal ->
                    log.warn("[GroqClient] Retry attempt {} after: {}",
                            signal.totalRetries() + 1, signal.failure().getMessage()));
    }

    private LlmException handle4xx(int status, String body) {
        if (status == 429) {
            log.warn("[GroqClient] Rate limited by Groq: {}", body);
            return new LlmException(Reason.RATE_LIMITED, "Groq rate limit exceeded");
        }
        if (status == 401) {
            log.error("[GroqClient] Unauthorized — check GROQ_API_KEY");
            return new LlmException(Reason.API_KEY_MISSING, "Invalid Groq API key");
        }
        return new LlmException(Reason.INVALID_RESPONSE, "Groq 4xx: " + status + " " + body);
    }

    private Throwable wrapIfNeeded(Throwable e) {
        if (e instanceof LlmException) return e;
        if (e.getMessage() != null && e.getMessage().contains("circuit")) {
            return new LlmException(Reason.CIRCUIT_OPEN, "Circuit breaker is open", e);
        }
        return new LlmException(Reason.PROVIDER_UNAVAILABLE, "Unexpected error: " + e.getMessage(), e);
    }

    /** Парсит SSE-чанк потока, возвращает текстовый токен или null */
    private String extractStreamChunk(String raw) {
        String line = raw.trim();
        if (line.startsWith("data: ")) line = line.substring(6).trim();
        if (line.isEmpty()) return null;
        if ("[DONE]".equals(line)) return "[DONE]";

        try {
            JsonNode node = objectMapper.readTree(line);
            JsonNode choices = node.get("choices");
            if (choices != null && choices.isArray() && !choices.isEmpty()) {
                JsonNode delta = choices.get(0).get("delta");
                if (delta != null && delta.has("content")) {
                    return delta.get("content").asText();
                }
            }
        } catch (Exception ignored) {
            // частичный чанк — игнорируем
        }
        return null;
    }

    /** Извлекает content из non-stream ответа и логирует токены */
    private String extractContentAndRecordUsage(JsonNode response, Long userId, String endpoint) {
        try {
            JsonNode usage = response.get("usage");
            if (usage != null && userId != null) {
                int promptTokens = usage.has("prompt_tokens") ? usage.get("prompt_tokens").asInt() : 0;
                int completionTokens = usage.has("completion_tokens") ? usage.get("completion_tokens").asInt() : 0;
                int totalTokens = usage.has("total_tokens") ? usage.get("total_tokens").asInt() : 0;
                tokenAccountingService.recordUsageAsync(userId, this.model, promptTokens, completionTokens, totalTokens, endpoint);
            }

            return response
                    .get("choices").get(0)
                    .get("message")
                    .get("content").asText();
        } catch (Exception e) {
            throw new LlmException(Reason.INVALID_RESPONSE, "Cannot extract content from response");
        }
    }

    /** Проверяет, что строка — валидный JSON и очищает маркдаун если нужно */
    private String cleanAndValidateJson(String content) {
        if (content == null) return "{}";
        String cleaned = content.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        }
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();
        try {
            objectMapper.readTree(cleaned);
            return cleaned;
        } catch (Exception e) {
            log.error("[GroqClient] Response is not valid JSON: {}", content);
            throw new LlmException(Reason.INVALID_RESPONSE, "LLM returned invalid JSON");
        }
    }
}
