package com.medev.modules.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final LlmProvider llmProvider;

    public Flux<String> streamChat(String userMessage, String systemPrompt, List<Map<String, String>> previousHistory) {
        List<Map<String, String>> messages = new ArrayList<>();
        
        messages.add(Map.of("role", "system", "content", systemPrompt));
        
        if (previousHistory != null) {
            messages.addAll(previousHistory);
        }
        
        messages.add(Map.of("role", "user", "content", userMessage));

        return llmProvider.streamCompletion(messages);
    }
}
