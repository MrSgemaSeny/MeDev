package com.medev.modules.profile.service;

import com.medev.modules.profile.dto.ProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class ReadmeGeneratorService {

    private TemplateEngine textTemplateEngine;

    @PostConstruct
    public void init() {
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        templateResolver.setPrefix("templates/profile/");
        templateResolver.setSuffix(".md");
        templateResolver.setTemplateMode(TemplateMode.TEXT);
        templateResolver.setCharacterEncoding("UTF-8");

        textTemplateEngine = new org.thymeleaf.spring6.SpringTemplateEngine();
        textTemplateEngine.setTemplateResolver(templateResolver);
    }

    public String generateReadme(ProfileDto profile) {
        return generateReadme(profile, "full");
    }

    public String generateReadme(ProfileDto profile, String template) {
        Context context = new Context();
        context.setVariable("profile", profile);
        String templateName = switch (template != null ? template.toLowerCase().trim() : "") {
            case "minimal" -> "readme-minimal";
            case "creative" -> "readme-creative";
            case "classic" -> "readme";
            default -> "readme-full";
        };
        return textTemplateEngine.process(templateName, context);
    }
}
