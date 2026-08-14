package com.medev.modules.ai.config;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Optional;

@Configuration
public class MockVectorStoreConfig {

    @Bean
    public VectorStore vectorStore() {
        return new VectorStore() {
            @Override
            public void add(List<Document> documents) {
                // No-op
            }

            @Override
            public Optional<Boolean> delete(List<String> idList) {
                return Optional.of(true);
            }

            @Override
            public List<Document> similaritySearch(SearchRequest request) {
                return List.of();
            }

            @Override
            public List<Document> similaritySearch(String query) {
                return List.of();
            }
        };
    }
}
