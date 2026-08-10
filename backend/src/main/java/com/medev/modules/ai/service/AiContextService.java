package com.medev.modules.ai.service;

import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.auth.entity.User;
import com.medev.modules.github.service.GitHubService;
import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiContextService {

    private final ProfileService profileService;
    private final UserRepository userRepository;
    private final GitHubService gitHubService;

    public String buildSystemPrompt(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        ProfileDto profile = profileService.getByUserId(userId);

        StringBuilder sb = new StringBuilder();
        sb.append("Ты — профессиональный AI ассистент платформы MeDev для разработчиков.\n");
        sb.append("Ты знаешь профиль пользователя и помогаешь улучшить резюме и портфолио.\n");
        sb.append("Отвечай конкретно, без воды. Давай actionable советы. Если с тобой просто здороваются - будь вежлив, назови пользователя по имени и предложи помощь.\n");
        sb.append("КРИТИЧЕСКОЕ ПРАВИЛО: Обращайся к пользователю СТРОГО по имени, указанному в профиле. НИКОГДА не сокращай, не придумывай клички и не изменяй его имя! Это крайне важно.\n\n");

        sb.append("=== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ===\n");
        sb.append("Имя: ").append(profile.getFullName() != null ? profile.getFullName() : "Не указано").append("\n");
        sb.append("Должность: ").append(profile.getHeadline() != null ? profile.getHeadline() : "Не указана").append("\n");
        sb.append("Summary: ").append(truncate(profile.getSummary(), 1000)).append("\n");
        sb.append("Локация: ").append(profile.getLocation() != null ? profile.getLocation() : "Не указана").append("\n");
        sb.append("Тариф: ").append(user.getPlan() != null ? user.getPlan().name() : "FREE").append("\n\n");

        if (profile.getExperience() != null && !profile.getExperience().isEmpty()) {
            sb.append("=== ОПЫТ РАБОТЫ ===\n");
            profile.getExperience().forEach(e -> {
                sb.append("- ").append(e.getPosition()).append(" в ").append(e.getCompany())
                  .append(" (").append(e.getStartDate()).append(" — ").append(e.getIsCurrent() != null && e.getIsCurrent() ? "Present" : e.getEndDate()).append(")\n");
                if (e.getDescription() != null && !e.getDescription().isEmpty()) {
                    sb.append("  ").append(truncate(e.getDescription(), 500).replace("\n", "\n  ")).append("\n");
                }
            });
            sb.append("\n");
        }

        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            sb.append("=== НАВЫКИ ===\n");
            profile.getSkills().forEach(s ->
                sb.append("- ").append(s.getName()).append(" (").append(s.getLevel()).append(")\n")
            );
            sb.append("\n");
        }

        if (profile.getProjects() != null && !profile.getProjects().isEmpty()) {
            sb.append("=== ПРОЕКТЫ ===\n");
            profile.getProjects().forEach(p -> {
                sb.append("- ").append(p.getName()).append(": ").append(truncate(p.getDescription(), 300)).append("\n");
                if (p.getGithubUrl() != null && !p.getGithubUrl().isEmpty()) {
                    sb.append("  URL: ").append(p.getGithubUrl()).append("\n");
                }
            });
            sb.append("\n");
        }

        if (profile.getGithubUsername() != null && !profile.getGithubUsername().isEmpty()) {
            sb.append("=== GITHUB ===\n");
            sb.append("Username: ").append(profile.getGithubUsername()).append("\n");
            String githubRepos = gitHubService.fetchUserPublicRepos(profile.getGithubUsername());
            if (!githubRepos.isEmpty()) {
                sb.append(githubRepos).append("\n");
            }
        }

        return sb.toString();
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "Нет данных";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }
}
