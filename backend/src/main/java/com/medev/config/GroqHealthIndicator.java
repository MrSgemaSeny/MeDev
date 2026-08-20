package com.medev.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class GroqHealthIndicator implements HealthIndicator {

    @Value("${groq.api-key:}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    @Override
    public Health health() {
        if (apiKey == null || apiKey.isBlank()) {
            return Health.up()
                    .withDetail("groq", "Configured without API key (fallback mode)")
                    .withDetail("model", model)
                    .build();
        }

        return Health.up()
                .withDetail("groq", "API key configured")
                .withDetail("model", model)
                .build();
    }
}