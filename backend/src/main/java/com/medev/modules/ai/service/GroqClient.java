package com.medev.modules.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GroqClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${groq.api-key}")
    private String apiKey;

    @Value("${groq.api-url}")
    private String apiUrl;

    public String sendChatCompletion(String systemPrompt, String userMessage) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("Groq API key is not configured");
        }

        Map<String, Object> requestBody = Map.of(
                "model", "llama3-70b-8192",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "temperature", 0.1,
                "response_format", Map.of("type", "json_object")
        );

        Map response = webClientBuilder.build()
                .post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(java.time.Duration.ofSeconds(60))
                .retryWhen(reactor.util.retry.Retry.backoff(3, java.time.Duration.ofSeconds(2)))
                .block();

        if (response != null && response.containsKey("choices")) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (!choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                if (message != null && message.containsKey("content")) {
                    return (String) message.get("content");
                }
            }
        }
        throw new RuntimeException("Failed to get a valid response from Groq API");
    }

    public reactor.core.publisher.Flux<String> streamChatCompletion(List<Map<String, String>> messages) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("Groq API key is not configured");
        }

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", messages,
                "temperature", 0.7,
                "stream", true
        );

        return webClientBuilder.build()
                .post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .takeUntil(chunk -> {
                    String clean = chunk.trim();
                    if (clean.startsWith("data: ")) clean = clean.substring(6).trim();
                    return clean.equals("[DONE]");
                })
                .mapNotNull(chunk -> {
                    String cleanChunk = chunk.trim();
                    if (cleanChunk.startsWith("data: ")) {
                        cleanChunk = cleanChunk.substring(6).trim();
                    }
                    if (cleanChunk.equals("[DONE]") || cleanChunk.isEmpty()) return null;
                    try {
                        com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(cleanChunk);
                        com.fasterxml.jackson.databind.JsonNode choices = node.get("choices");
                        if (choices != null && choices.isArray() && choices.size() > 0) {
                            com.fasterxml.jackson.databind.JsonNode delta = choices.get(0).get("delta");
                            if (delta != null && delta.has("content")) {
                                return delta.get("content").asText();
                            }
                        }
                    } catch (Exception e) {
                        // ignore parsing errors for partial chunks
                    }
                    return "";
                })
                .filter(s -> !s.isEmpty())
                .onErrorResume(e -> reactor.core.publisher.Flux.empty());
    }
}
