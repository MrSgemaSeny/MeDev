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
}
