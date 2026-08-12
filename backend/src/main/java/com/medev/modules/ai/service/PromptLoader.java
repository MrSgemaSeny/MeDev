package com.medev.modules.ai.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Загружает промпты из src/main/resources/prompts/*.txt при старте.
 * Кэширует в памяти — промпты не меняются в runtime.
 *
 * Версионирование: prompt_name_v2.txt → активная версия выбирается
 * через application.yml: ai.prompts.summary=summary_v2
 * Старые версии не удалять — нужны для regression-тестов.
 */
@Slf4j
@Component
public class PromptLoader {

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    @PostConstruct
    public void preloadAll() {
        // Перечисляем известные промпты — загружаем при старте,
        // чтобы ошибка конфигурации была видна сразу, не в runtime
        String[] knownPrompts = {
            "resume_parser_v1",
            "summary_generator_v1",
            "project_description_v1",
            "resume_analyzer_v1",
            "assistant_system_v1",
            "onboarding_wizard_v1"
        };

        for (String name : knownPrompts) {
            try {
                load(name); // результат кэшируется внутри
            } catch (Exception e) {
                // Не падаем при старте — логируем warning.
                // Если промпт реально нужен но не найден — упадёт при вызове.
                log.warn("[PromptLoader] Prompt not found at startup: prompts/{}.txt", name);
            }
        }

        log.info("[PromptLoader] Loaded {} prompts: {}", cache.size(), cache.keySet());
    }

    /**
     * Возвращает содержимое промпта по имени.
     * Пример: load("summary_generator_v1")
     *
     * @throws IllegalStateException если файл не найден
     */
    public String load(String name) {
        return cache.computeIfAbsent(name, this::readFromClasspath);
    }

    private String readFromClasspath(String name) {
        String path = "prompts/" + name + ".txt";
        try {
            ClassPathResource resource = new ClassPathResource(path);
            byte[] bytes = resource.getInputStream().readAllBytes();
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException(
                "[PromptLoader] Cannot load prompt: " + path + ". " +
                "Create the file in src/main/resources/prompts/", e
            );
        }
    }
}
