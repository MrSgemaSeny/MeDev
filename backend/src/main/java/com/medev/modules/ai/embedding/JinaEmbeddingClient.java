package com.medev.modules.ai.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.netty.resolver.DefaultAddressResolverGroup;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.netty.http.client.HttpClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class JinaEmbeddingClient {

    private final WebClient webClient;
    private final String apiKey;
    private final String apiUrl;
    private final String model;

    public JinaEmbeddingClient(
            WebClient.Builder webClientBuilder,
            @Value("${jina.api-key:}") String apiKey,
            @Value("${jina.base-url:https://api.jina.ai/v1}") String baseUrl,
            @Value("${jina.model:jina-embeddings-v2-base-en}") String model
    ) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.apiUrl = baseUrl.replaceAll("/+$", "") + "/embeddings";
        this.model = (model == null || model.isBlank()) ? "jina-embeddings-v2-base-en" : model.trim();

        if (this.apiKey.isBlank()) {
            log.warn("[JinaEmbeddingClient] JINA_API_KEY is not configured — Vector embedding generation will not be available in live mode");
        }

        HttpClient httpClient = HttpClient.create()
                .resolver(DefaultAddressResolverGroup.INSTANCE)
                .responseTimeout(Duration.ofSeconds(12));

        this.webClient = webClientBuilder
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    /**
     * Generates vector embeddings for a list of texts using Jina AI API.
     *
     * @param texts List of string chunks to embed
     * @return List of float[] vector arrays (768 dimensions for jina-embeddings-v2-base-en)
     */
    public List<float[]> embed(List<String> texts) {
        if (texts == null || texts.isEmpty()) {
            return List.of();
        }

        if (apiKey.isBlank()) {
            throw new IllegalStateException("Cannot generate embeddings: JINA_API_KEY is not configured");
        }

        Map<String, Object> payload = Map.of(
                "model", model,
                "normalized", true,
                "embedding_type", "float",
                "input", texts
        );

        try {
            JsonNode root = webClient.post()
                    .uri(apiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .timeout(Duration.ofSeconds(12))
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(500))
                            .filter(ex -> ex instanceof WebClientResponseException wce && wce.getStatusCode().is5xxServerError()))
                    .block();

            if (root == null || !root.has("data") || !root.get("data").isArray()) {
                throw new RuntimeException("Unexpected response from Jina AI: missing 'data' array");
            }

            JsonNode dataArray = root.get("data");
            List<float[]> result = new ArrayList<>(dataArray.size());

            for (JsonNode item : dataArray) {
                JsonNode embeddingNode = item.get("embedding");
                if (embeddingNode != null && embeddingNode.isArray()) {
                    int dim = embeddingNode.size();
                    float[] vector = new float[dim];
                    for (int i = 0; i < dim; i++) {
                        vector[i] = (float) embeddingNode.get(i).asDouble();
                    }
                    result.add(vector);
                } else {
                    log.warn("[JinaEmbeddingClient] Missing embedding array in item: {}", item);
                }
            }

            return result;
        } catch (Exception e) {
            log.error("[JinaEmbeddingClient] Failed to generate embeddings for {} items: {}", texts.size(), e.getMessage());
            throw new RuntimeException("Failed to generate vector embeddings via Jina AI: " + e.getMessage(), e);
        }
    }
}
