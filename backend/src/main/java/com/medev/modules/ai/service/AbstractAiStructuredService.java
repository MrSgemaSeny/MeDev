package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.model.LlmException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
public abstract class AbstractAiStructuredService {

    protected final LlmProvider llmProvider;
    protected final ObjectMapper objectMapper;

    /**
     * Executes a structured completion request to the LLM and parses the response.
     *
     * @param systemPrompt The system prompt defining the JSON structure.
     * @param userMessage  The user prompt with the data.
     * @param responseType The class to deserialize the JSON into.
     * @param <T>          The type of the expected response.
     * @return The deserialized response object.
     * @throws LlmException if the response cannot be parsed into the expected type.
     */
    protected <T> T generateStructuredData(String systemPrompt, String userMessage, Class<T> responseType) {
        String jsonResponse = llmProvider.structuredCompletion(systemPrompt, userMessage);
        
        try {
            return objectMapper.readValue(jsonResponse, responseType);
        } catch (Exception e) {
            log.error("Failed to parse JSON from LLM: {}", jsonResponse, e);
            throw new LlmException(LlmException.Reason.INVALID_RESPONSE, "Invalid JSON format from AI");
        }
    }
}
