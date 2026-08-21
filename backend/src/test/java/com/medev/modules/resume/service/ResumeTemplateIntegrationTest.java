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
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

public class ResumeTemplateIntegrationTest {

    private SpringTemplateEngine templateEngine;
    private ProfileDto fullProfile;
    private ProfileDto cyrillicProfile;
    private List<String> fontPaths = new ArrayList<>();

    @BeforeEach
    void setUp() throws Exception {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);

        templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(resolver);

        // Standard Latin profile
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

        // Cyrillic Profile (Russian & Kazakh)
        cyrillicProfile = new ProfileDto();
        cyrillicProfile.setFullName("Мұрат Орынбасар");
        cyrillicProfile.setGithubUsername("MrSgemaSeny");
        cyrillicProfile.setLocation("Қазақстан, Алматы / Астана");
        cyrillicProfile.setWebsite("https://medev.dev");
        cyrillicProfile.setLinkedin("https://linkedin.com/in/muratorynbasar");
        cyrillicProfile.setTelegram("@sgemaseny");
        cyrillicProfile.setSummary("Ведущий инженер-программист и архитектор. Разработка высоконагруженных SaaS-платформ и микросервисов.");

        ExperienceDto cExp = new ExperienceDto();
        cExp.setPosition("Ведущий разработчик / Тимлид");
        cExp.setCompany("ТОО ЖанФинанс");
        cExp.setStartDate(LocalDate.of(2025, 6, 1));
        cExp.setIsCurrent(true);
        cExp.setDescription("Проектирование и разработка B2B CRM платформы с нуля. 6 уровней RBAC, миграции Flyway.");
        cExp.setTechStack("Java 17, Spring Boot 3, React 19, PostgreSQL");
        cyrillicProfile.setExperience(List.of(cExp));

        EducationDto cEdu = new EducationDto();
        cEdu.setInstitution("Университет им. Сулеймана Демиреля (СДУ)");
        cEdu.setDegree("Бакалавр наук");
        cEdu.setField("Информационные системы и программирование");
        cEdu.setStartDate(LocalDate.of(2022, 9, 1));
        cEdu.setEndDate(LocalDate.of(2026, 6, 1));
        cEdu.setIsCurrent(false);
        cyrillicProfile.setEducation(List.of(cEdu));

        SkillDto cs1 = new SkillDto();
        cs1.setName("Java & Spring Boot");
        cs1.setCategory("Бэкенд");
        SkillDto cs2 = new SkillDto();
        cs2.setName("React & TypeScript");
        cs2.setCategory("Фронтенд");
        cyrillicProfile.setSkills(List.of(cs1, cs2));

        LanguageDto cLang1 = new LanguageDto();
        cLang1.setName("Қазақ тілі");
        cLang1.setLevel("Ана тілі");
        LanguageDto cLang2 = new LanguageDto();
        cLang2.setName("Русский язык");
        cLang2.setLevel("Свободный");
        cyrillicProfile.setLanguages(List.of(cLang1, cLang2));

        ProjectDto cProj = new ProjectDto();
        cProj.setName("MeDev Платформа");
        cProj.setDescription("Платформа для автоматизации карьерного трекинга и генерации резюме.");
        cProj.setGithubUrl("https://github.com/MrSgemaSeny/MeDev");
        cProj.setTechStack("Spring Boot 3, React 19");
        cProj.setIsVisible(true);
        cyrillicProfile.setProjects(List.of(cProj));
        cyrillicProfile.setSectionOrder(List.of("summary", "experience", "education", "skills", "languages", "projects"));

        // Extract fonts for PDF test renderer
        String[] fontFiles = {
            "Roboto-Regular.ttf", "Roboto-Bold.ttf",
            "Inter-Regular.ttf", "Inter-Medium.ttf", "Inter-SemiBold.ttf", "Inter-Bold.ttf",
            "SpaceGrotesk-Regular.ttf", "SpaceGrotesk-Medium.ttf", "SpaceGrotesk-SemiBold.ttf", "SpaceGrotesk-Bold.ttf",
            "Lora-Regular.ttf", "Lora-Italic.ttf", "Lora-SemiBold.ttf",
            "PlayfairDisplay-SemiBold.ttf", "PlayfairDisplay-Bold.ttf",
            "Anton-Regular.ttf"
        };

        for (String fontFile : fontFiles) {
            try (InputStream in = getClass().getClassLoader().getResourceAsStream("fonts/" + fontFile)) {
                if (in != null) {
                    String prefix = fontFile.substring(0, fontFile.lastIndexOf('.'));
                    Path tempFile = Files.createTempFile(prefix, ".ttf");
                    tempFile.toFile().deleteOnExit();
                    Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
                    fontPaths.add(tempFile.toAbsolutePath().toString());
                }
            }
        }
    }

    private Context createContext(ProfileDto profile, boolean singlePage) {
        Context context = new Context();
        context.setVariable("profile", profile);
        context.setVariable("singlePage", singlePage);
        context.setVariable("generatedAt", LocalDate.now());
        context.setVariable("avatarBase64", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");

        if (profile.getSkills() != null) {
            Map<String, List<String>> groupedSkills = profile.getSkills().stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            s -> s.getCategory() != null && !s.getCategory().isBlank() ? s.getCategory() : "General",
                            java.util.stream.Collectors.mapping(SkillDto::getName, java.util.stream.Collectors.toList())
                    ));
            context.setVariable("groupedSkills", groupedSkills);
        }

        if (profile.getLanguages() != null) {
            String languagesStr = profile.getLanguages().stream()
                    .map(l -> l.getName() + (l.getLevel() != null && !l.getLevel().isBlank() ? " (" + l.getLevel() + ")" : ""))
                    .collect(java.util.stream.Collectors.joining(", "));
            context.setVariable("languagesStr", languagesStr);
        }
        return context;
    }

    @ParameterizedTest(name = "HTML Generation for template: {0} (Single-Page)")
    @ValueSource(strings = {"clean", "github", "apple-modern", "grok-monolith", "milky-soft", "phub-orange"})
    @DisplayName("HTML render check for all 6 templates in single-page mode")
    void testHtmlGeneration_singlePage(String templateName) {
        Context context = createContext(fullProfile, true);
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
        Context context = createContext(fullProfile, false);
        String html = templateEngine.process("resume/" + templateName, context);

        assertThat(html).isNotBlank();
        assertThat(html).contains("Murat Orynbasar");
        assertThat(html).contains("MeDev");
    }

    @ParameterizedTest(name = "PDF Binary Generation for template: {0}")
    @ValueSource(strings = {"clean", "github", "apple-modern", "grok-monolith", "milky-soft", "phub-orange"})
    @DisplayName("Strict Flying Saucer XML parse & PDF binary generation for all 6 templates")
    void testPdfBinaryGeneration_allTemplates(String templateName) {
        Context context = createContext(fullProfile, true);
        String html = templateEngine.process("resume/" + templateName, context);

        assertThatCode(() -> {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            for (String fontPath : fontPaths) {
                renderer.getFontResolver().addFont(fontPath, "Identity-H", true);
            }
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(out);
            renderer.finishPDF();

            byte[] pdfBytes = out.toByteArray();
            assertThat(pdfBytes).isNotEmpty();
            assertThat(new String(pdfBytes, 0, Math.min(10, pdfBytes.length))).startsWith("%PDF-");
        }).doesNotThrowAnyException();
    }

    @ParameterizedTest(name = "Cyrillic PDF Binary Generation for template: {0}")
    @ValueSource(strings = {"clean", "github", "apple-modern", "grok-monolith", "milky-soft", "phub-orange"})
    @DisplayName("Cyrillic font rendering test (Russian/Kazakh) for all 6 templates")
    void testCyrillicPdfGeneration_allTemplates(String templateName) {
        Context context = createContext(cyrillicProfile, true);
        String html = templateEngine.process("resume/" + templateName, context);

        assertThatCode(() -> {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            for (String fontPath : fontPaths) {
                renderer.getFontResolver().addFont(fontPath, "Identity-H", true);
            }
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
