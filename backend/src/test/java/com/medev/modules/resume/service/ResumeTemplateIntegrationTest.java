package com.medev.modules.resume.service;

import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.dto.ProjectDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = com.medev.MeDevApplication.class)
public class ResumeTemplateIntegrationTest {

    @Autowired
    private TemplateEngine templateEngine;

    @Test
    void testAllTemplatesRenderWithoutSpELErrors() {
        ProfileDto profile = new ProfileDto();
        profile.setFullName("Test User");
        profile.setGithubUsername("testuser");
        
        ProjectDto project = new ProjectDto();
        project.setName("Test Project");
        project.setGithubUrl("https://github.com/test");
        project.setLiveUrl("https://test.com");
        project.setIsVisible(true);
        profile.setProjects(List.of(project));

        Context context = new Context();
        context.setVariable("profile", profile);
        context.setVariable("generatedAt", LocalDate.now());
        context.setVariable("avatarBase64", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");

        String[] templates = {"apple-modern", "github", "grok-monolith", "milky-soft", "phub-orange"};
        
        for (String tmpl : templates) {
            String pdfHtml = templateEngine.process("resume/" + tmpl, context);
            assertThat(pdfHtml).isNotBlank();
            
            String webHtml = templateEngine.process("resume-html/" + tmpl, context);
            assertThat(webHtml).isNotBlank();
        }
    }
}
