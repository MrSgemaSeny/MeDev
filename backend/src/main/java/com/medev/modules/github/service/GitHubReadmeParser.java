package com.medev.modules.github.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class GitHubReadmeParser {

    private static final List<String> TECH_KEYWORDS = List.of(
            "Java", "Spring Boot", "Spring", "Hibernate", "PostgreSQL", "MySQL", "Redis",
            "Docker", "Kubernetes", "AWS", "GCP", "Azure",
            "React", "Angular", "Vue", "Next.js", "TypeScript", "JavaScript",
            "Python", "Django", "FastAPI", "Flask",
            "Node.js", "Express", "NestJS",
            "Go", "Rust", "C++", "C#", ".NET",
            "MongoDB", "Cassandra", "Elasticsearch", "Kafka", "RabbitMQ",
            "HTML", "CSS", "Tailwind", "Bootstrap", "GraphQL", "REST"
    );

    public List<String> extractTechnologies(String readmeContent) {
        if (readmeContent == null || readmeContent.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> found = new ArrayList<>();
        String upperContent = readmeContent.toUpperCase();

        for (String tech : TECH_KEYWORDS) {
            // Use word boundaries to avoid partial matches (e.g., "Go" in "Good")
            // Exception: C++, C# which have special characters
            String patternString;
            if (tech.equals("C++")) {
                patternString = "(?i)\\bC\\+\\+(?!\\w)";
            } else if (tech.equals("C#")) {
                patternString = "(?i)\\bC#(?!\\w)";
            } else if (tech.equals(".NET")) {
                patternString = "(?i)(?<!\\w)\\.NET(?!\\w)";
            } else if (tech.equals("Node.js") || tech.equals("Next.js")) {
                patternString = "(?i)\\b" + tech.replace(".", "\\.") + "(?!\\w)";
            } else {
                patternString = "(?i)\\b" + tech + "\\b";
            }

            Pattern pattern = Pattern.compile(patternString);
            Matcher matcher = pattern.matcher(readmeContent);
            if (matcher.find()) {
                found.add(tech);
            }
        }

        return found.stream().distinct().collect(Collectors.toList());
    }
}
