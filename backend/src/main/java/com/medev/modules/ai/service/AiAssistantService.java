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
            int limit = 20;
            int start = Math.max(0, previousHistory.size() - limit);
            for (int i = start; i < previousHistory.size(); i++) {
                Map<String, String> msg = previousHistory.get(i);
                String role = msg.getOrDefault("role", "user");
                if (!"user".equals(role) && !"assistant".equals(role)) continue;
                String content = msg.getOrDefault("content", "");
                if (content.length() > 2000) content = content.substring(0, 2000);
                messages.add(Map.of("role", role, "content", content));
            }
        }
        
        messages.add(Map.of("role", "user", "content", userMessage));

        return llmProvider.streamCompletion(messages);
    }
}
