package com.medev.modules.ai.service;

import reactor.core.publisher.Flux;
import java.util.List;
import java.util.Map;

/**
 * Абстракция LLM-провайдера.
 * Текущая реализация: GroqClient.
 * При смене провайдера (OpenRouter, Anthropic) — новый бин, тот же интерфейс.
 */
public interface LlmProvider {

    /**
     * Стриминг ответа чанками.
     * @param messages история + system prompt в формате [{role, content}]
     * @return Flux<String> — поток текстовых чанков
     */
    Flux<String> streamCompletion(List<Map<String, String>> messages);

    /**
     * Структурированный ответ в JSON.
     * Гарантирует валидный JSON или бросает LlmException.
     * @param systemPrompt инструкция с описанием схемы
     * @param userMessage входные данные пользователя
     * @return строка с валидным JSON
     */
    String structuredCompletion(String systemPrompt, String userMessage);

    /**
     * Название провайдера для логирования и метрик.
     */
    String providerName();
}
