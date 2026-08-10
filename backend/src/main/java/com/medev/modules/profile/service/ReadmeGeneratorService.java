package com.medev.modules.profile.service;

import com.medev.modules.profile.entity.Profile;
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

        textTemplateEngine = new TemplateEngine();
        textTemplateEngine.setTemplateResolver(templateResolver);
    }

    public String generateReadme(Profile profile) {
        Context context = new Context();
        context.setVariable("profile", profile);
        return textTemplateEngine.process("readme", context);
    }
}
