package com.medev.modules.resume.service;

import com.medev.modules.profile.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

public class ResumeTemplateIntegrationTest {

    private SpringTemplateEngine templateEngine;
    private ProfileDto fullProfile;

    @BeforeEach
    void setUp() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);

        templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(resolver);

        fullProfile = new ProfileDto();
        fullProfile.setFullName("Murat Orynbasar");
        fullProfile.setGithubUsername("MrSgemaSeny");
        fullProfile.setLocation("Kazakhstan, Almaty");
        fullProfile.setWebsite("https://medev.dev");
        fullProfile.setLinkedin("https://linkedin.com/in/muratorynbasar");
        fullProfile.setTelegram("@sgemaseny");
        fullProfile.setSummary("Senior Full-Stack Engineer and Architect. Specialized in building data-first SaaS platforms and high-load systems.");

        ExperienceDto exp1 = new ExperienceDto();
        exp1.setPosition("Tech Lead / Full-Stack Engineer");
        exp1.setCompany("ZhanFinance (JF-1C)");
        exp1.setStartDate(LocalDate.of(2025, 6, 1));
        exp1.setIsCurrent(true);
        exp1.setDescription("Architected B2B SaaS CRM platform from scratch. 6-tier RBAC, Flyway V1-V108 migrations, STOMP chat.");
        exp1.setTechStack("Java 17, Spring Boot 3, React 19, TypeScript, PostgreSQL, Redis, Fly.io");

        ExperienceDto exp2 = new ExperienceDto();
        exp2.setPosition("Full-Stack Engineer");
        exp2.setCompany("testCinema");
        exp2.setStartDate(LocalDate.of(2024, 9, 1));
        exp2.setEndDate(LocalDate.of(2025, 6, 1));
        exp2.setIsCurrent(false);
        exp2.setDescription("Developed online streaming platform for Kazakh content with ML recommendation pipeline.");
        exp2.setTechStack("React, TypeScript, Python FastAPI, Spring Boot, Docker");

        fullProfile.setExperience(List.of(exp1, exp2));

        EducationDto edu1 = new EducationDto();
        edu1.setInstitution("SDU University");
        edu1.setDegree("Bachelor of Science");
        edu1.setField("Computer Science & Information Systems");
        edu1.setStartDate(LocalDate.of(2022, 9, 1));
        edu1.setEndDate(LocalDate.of(2026, 6, 1));
        edu1.setIsCurrent(false);

        fullProfile.setEducation(List.of(edu1));

        SkillDto s1 = new SkillDto();
        s1.setName("Java 17 & Spring Boot 3.3");
        s1.setCategory("Backend");

        SkillDto s2 = new SkillDto();
        s2.setName("PostgreSQL & Redis");
        s2.setCategory("Backend");

        SkillDto s3 = new SkillDto();
        s3.setName("React 19 & TypeScript");
        s3.setCategory("Frontend");

        SkillDto s4 = new SkillDto();
        s4.setName("Docker & GitHub Actions");
        s4.setCategory("DevOps");

        fullProfile.setSkills(List.of(s1, s2, s3, s4));

        LanguageDto lang1 = new LanguageDto();
        lang1.setName("English");
        lang1.setLevel("Professional Working (C1)");

        LanguageDto lang2 = new LanguageDto();
        lang2.setName("Russian");
        lang2.setLevel("Native");

        fullProfile.setLanguages(List.of(lang1, lang2));

        ProjectDto proj1 = new ProjectDto();
        proj1.setName("MeDev");
        proj1.setDescription("Data-first SaaS platform for software engineers. Automates career management and PDF resume generation.");
        proj1.setGithubUrl("https://github.com/MrSgemaSeny/MeDev");
        proj1.setLiveUrl("https://medev.dev");
        proj1.setTechStack("Java 17, Spring Boot, React 19, Tailwind CSS");
        proj1.setIsVisible(true);

        ProjectDto proj2 = new ProjectDto();
        proj2.setName("Envie");
        proj2.setDescription("Personal developer command center: twitter-style notes, kanban, ideas board, markdown knowledge base.");
        proj2.setGithubUrl("https://github.com/MrSgemaSeny/Envie");
        proj2.setTechStack("React, TypeScript, Vite, Tailwind v4");
        proj2.setIsVisible(true);

        fullProfile.setProjects(List.of(proj1, proj2));
        fullProfile.setSectionOrder(List.of("summary", "experience", "education", "skills", "languages", "projects"));
    }

    private Context createContext(boolean singlePage) {
        Context context = new Context();
        context.setVariable("profile", fullProfile);
        context.setVariable("singlePage", singlePage);
        context.setVariable("generatedAt", LocalDate.now());
        context.setVariable("avatarBase64", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");

        Map<String, List<String>> groupedSkills = Map.of(
                "Backend", List.of("Java 17 & Spring Boot 3.3", "PostgreSQL & Redis"),
                "Frontend", List.of("React 19 & TypeScript"),
                "DevOps", List.of("Docker & GitHub Actions")
        );
        context.setVariable("groupedSkills", groupedSkills);
        context.setVariable("languagesStr", "English (Professional Working C1), Russian (Native)");
        return context;
    }

    @ParameterizedTest(name = "HTML Generation for template: {0} (Single-Page)")
    @ValueSource(strings = {"clean", "github", "apple-modern", "grok-monolith", "milky-soft", "phub-orange"})
    @DisplayName("HTML render check for all 6 templates in single-page mode")
    void testHtmlGeneration_singlePage(String templateName) {
        Context context = createContext(true);
        String html = templateEngine.process("resume/" + templateName, context);

        assertThat(html).isNotBlank();
        assertThat(html).contains("Murat Orynbasar");
        assertThat(html).contains("ZhanFinance");
        assertThat(html).contains("SDU University");
    }

    @ParameterizedTest(name = "HTML Generation for template: {0} (Multi-Page)")
    @ValueSource(strings = {"clean", "github", "apple-modern", "grok-monolith", "milky-soft", "phub-orange"})
    @DisplayName("HTML render check for all 6 templates in multi-page mode")
    void testHtmlGeneration_multiPage(String templateName) {
        Context context = createContext(false);
        String html = templateEngine.process("resume/" + templateName, context);

        assertThat(html).isNotBlank();
        assertThat(html).contains("Murat Orynbasar");
        assertThat(html).contains("MeDev");
    }

    @ParameterizedTest(name = "PDF Binary Generation for template: {0}")
    @ValueSource(strings = {"clean", "github", "apple-modern", "grok-monolith", "milky-soft", "phub-orange"})
    @DisplayName("Strict Flying Saucer XML parse & PDF binary generation for all 6 templates")
    void testPdfBinaryGeneration_allTemplates(String templateName) {
        Context context = createContext(true);
        String html = templateEngine.process("resume/" + templateName, context);

        assertThatCode(() -> {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(out);
            renderer.finishPDF();

            byte[] pdfBytes = out.toByteArray();
            assertThat(pdfBytes).isNotEmpty();
            assertThat(new String(pdfBytes, 0, Math.min(10, pdfBytes.length))).startsWith("%PDF-");
        }).doesNotThrowAnyException();
    }
}
