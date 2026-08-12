package com.medev.modules.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiGenerateService {

    private final LlmProvider llmProvider;
    private final PromptLoader promptLoader;

    public String generateSummary(String context, String language) {
        String systemPrompt = promptLoader.load("summary_generator_v1.txt");
        String userMessage = String.format("Language: %s\nContext:\n%s", language, context);
        return llmProvider.structuredCompletion(systemPrompt, userMessage);
    }

    public String generateProjectDescription(String context, String projectName, String language) {
        String systemPrompt = promptLoader.load("project_description_v1.txt");
        String userMessage = String.format("Language: %s\nProject: %s\nContext:\n%s", language, projectName, context);
        return llmProvider.structuredCompletion(systemPrompt, userMessage);
    }
}
