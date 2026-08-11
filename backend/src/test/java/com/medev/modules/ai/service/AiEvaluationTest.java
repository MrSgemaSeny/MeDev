package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import java.nio.file.Files;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Disabled("Requires Groq API Key and consumes quota. Run manually.")
class AiEvaluationTest {

    @Autowired
    private AiGenerateService aiGenerateService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGoldenDataset_GenerateSummary() throws Exception {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:golden/profile_*.json");

        assertTrue(resources.length > 0, "Golden dataset should not be empty");

        for (Resource resource : resources) {
            String jsonContent = Files.readString(resource.getFile().toPath());
            
            // 1. Сгенерировать
            String summary = aiGenerateService.generateSummary(jsonContent, "ru");
            
            // 2. Проверить результат (ожидаем структурированный JSON от LLM, 
            // т.к. AiGenerateService использует structuredCompletion, 
            // или хотя бы не пустую строку, если возвращается текст)
            assertNotNull(summary);
            assertTrue(summary.length() > 20, "Summary is too short for profile: " + resource.getFilename());
            
            // Если сервис настроен возвращать JSON с полем `summary`:
            // JsonNode root = objectMapper.readTree(summary);
            // assertTrue(root.has("summary"), "Missing 'summary' field in JSON response for " + resource.getFilename());
        }
    }
}
