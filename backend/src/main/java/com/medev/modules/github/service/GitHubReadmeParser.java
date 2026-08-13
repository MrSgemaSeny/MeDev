package com.medev.modules.github.service;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class GitHubReadmeParser {

    // Ключевые слова — расширяй по необходимости
    private static final List<String> KNOWN_TECHNOLOGIES = List.of(
        "Java", "Spring Boot", "Spring Security", "Spring Data",
        "React", "Vue", "Angular", "Next.js", "TypeScript", "JavaScript",
        "Python", "FastAPI", "Django", "Flask",
        "PostgreSQL", "MySQL", "MongoDB", "Redis",
        "Docker", "Kubernetes", "Terraform",
        "Kafka", "RabbitMQ",
        "GraphQL", "REST", "gRPC",
        "Flyway", "Liquibase",
        "AWS", "GCP", "Azure", "Fly.io",
        "GitHub Actions", "CI/CD",
        "Tailwind", "Sass",
        "Gradle", "Maven"
    );

    public List<String> extractTechnologies(String readme) {
        if (readme == null || readme.isBlank()) return List.of();

        List<String> found = new ArrayList<>();
        String lower = readme.toLowerCase();

        for (String tech : KNOWN_TECHNOLOGIES) {
            // Ищем как отдельное слово/фразу, case-insensitive
            Pattern pattern = Pattern.compile(
                "\\b" + Pattern.quote(tech.toLowerCase()) + "\\b"
            );
            if (pattern.matcher(lower).find()) {
                found.add(tech);
            }
        }

        return found;
    }
}
