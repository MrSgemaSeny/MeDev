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

    private final GroqClient groqClient;

    private static final String SYSTEM_PROMPT = 
        "Ты — помощник, который отвечает кратко, вежливо и по существу. Помоги пользователю быстро.\n" +
        "Если пользователь только открыл чат, напиши приветственное сообщение для ИИ-ассистента и уточни, чем помочь.";

    public Flux<String> streamChat(String userMessage, List<Map<String, String>> previousHistory) {
        List<Map<String, String>> messages = new ArrayList<>();
        
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        
        if (previousHistory != null) {
            messages.addAll(previousHistory);
        }
        
        messages.add(Map.of("role", "user", "content", userMessage));

        return groqClient.streamChatCompletion(messages);
    }
}
