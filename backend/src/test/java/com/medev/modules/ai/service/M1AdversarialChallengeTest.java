package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.dto.AiApplicationRequest;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.billing.service.SubscriptionService;
import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.service.ProfileService;
import com.medev.modules.resume.controller.ResumeController;
import com.medev.modules.resume.service.PdfGeneratorService;
import com.medev.shared.exception.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class M1AdversarialChallengeTest {

    // =========================================================================
    // 1. PII MASKER ADVERSARIAL STRESS SUITE
    // =========================================================================
    @Nested
    @DisplayName("Adversarial Challenge: PiiMasker")
    class PiiMaskerStressTests {
        private final PiiMasker piiMasker = new PiiMasker();

        @Test
        @DisplayName("Stress test: Extensive technical frameworks, languages, cloud tools preservation")
        void testTechnicalTerminologyPreservation() {
            String technicalText = 
                "Experienced Senior Principal Architect specializing in Spring Boot 3.3, Kubernetes StatefulSets, " +
                "Docker Swarm, Apache Kafka, PostgreSQL with pgvector, React 19, TypeScript 5.4, Next.js, Vue.js, " +
                "Ruby on Rails, ASP.NET Core, Python FastAPI, PyTorch, TensorFlow, Redis Cluster, AWS S3, GCP BigQuery, " +
                "GraphQL Apollo Client, RESTful APIs, Elasticsearch, OpenTelemetry, Prometheus, Grafana, CI/CD with GitHub Actions. " +
                "Graduated with Bachelor of Science in Computer Science and Master of Engineering in Artificial Intelligence " +
                "from Massachusetts Institute of Technology and Stanford University in Almaty, Kazakhstan.";

            String masked = piiMasker.mask(technicalText);

            assertThat(masked).doesNotContain("[NAME]");
            assertThat(masked).contains("Senior Principal Architect");
            assertThat(masked).contains("Spring Boot 3.3");
            assertThat(masked).contains("Kubernetes StatefulSets");
            assertThat(masked).contains("Apache Kafka");
            assertThat(masked).contains("PostgreSQL with pgvector");
            assertThat(masked).contains("React 19");
            assertThat(masked).contains("TypeScript 5.4");
            assertThat(masked).contains("Next.js");
            assertThat(masked).contains("Ruby on Rails");
            assertThat(masked).contains("ASP.NET Core");
            assertThat(masked).contains("Python FastAPI");
            assertThat(masked).contains("Bachelor of Science in Computer Science");
            assertThat(masked).contains("Master of Engineering in Artificial Intelligence");
            assertThat(masked).contains("Massachusetts Institute of Technology");
            assertThat(masked).contains("Stanford University");
            assertThat(masked).contains("Almaty, Kazakhstan");
        }

        @Test
        @DisplayName("Stress test: Numbers, metrics, GPA, date ranges, and code snippets should not be corrupted")
        void testMetricsAndCodePreservation() {
            String input = 
                "Maintained 99.99% SLA across 15 microservices handling 50,000 requests/sec. " +
                "Reduced P99 latency by 45ms. GPA: 3.85 / 4.0. Timeline: 2021-09-01 to 2025-06-30. " +
                "Repository: https://github.com/MrSgemaSeny/MeDev. Port: localhost:8080. Hash: a1b2c3d4e5f6. " +
                "Code: public static void main(String[] args) { int count = 42; }";

            String masked = piiMasker.mask(input);

            assertThat(masked).contains("99.99% SLA");
            assertThat(masked).contains("50,000 requests/sec");
            assertThat(masked).contains("45ms");
            assertThat(masked).contains("3.85 / 4.0");
            assertThat(masked).contains("2021-09-01 to 2025-06-30");
            assertThat(masked).contains("https://github.com/MrSgemaSeny/MeDev");
            assertThat(masked).contains("localhost:8080");
            assertThat(masked).contains("public static void main");
        }

        @Test
        @DisplayName("Stress test: Aggressive masking of diverse international phone and email formats")
        void testDiversePiiMasking() {
            String input = 
                "Contact details:\n" +
                "- Personal email: dev.senior_99+urgent@company.engineering\n" +
                "- Alt email: admin@subdomain.co.uk\n" +
                "- Kazakh phone 1: +7 (777) 123-45-67\n" +
                "- Kazakh phone 2: 87015554433\n" +
                "- Russian phone: +7 (495) 987-65-43\n" +
                "- US phone: +1 (555) 234-5678\n" +
                "- UK phone: +44 20 7946 0958\n" +
                "- Kazakh IIN: 980123350123\n" +
                "- Kazakh BIN: 123456789012\n" +
                "- US SSN: 123-45-6789\n";

            String masked = piiMasker.mask(input);

            assertThat(masked).doesNotContain("dev.senior_99+urgent@company.engineering");
            assertThat(masked).doesNotContain("admin@subdomain.co.uk");
            assertThat(masked).doesNotContain("123-45-67");
            assertThat(masked).doesNotContain("87015554433");
            assertThat(masked).doesNotContain("987-65-43");
            assertThat(masked).doesNotContain("234-5678");
            assertThat(masked).doesNotContain("980123350123");
            assertThat(masked).doesNotContain("123456789012");
            assertThat(masked).doesNotContain("123-45-6789");

            assertThat(masked).contains("[EMAIL]");
            assertThat(masked).contains("[PHONE]");
            assertThat(masked).contains("[ID_NUMBER]");
        }

        @Test
        @DisplayName("Stress test: 100k characters large text payload performance & safety")
        void testLargeTextPayload() {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 2000; i++) {
                sb.append("Software Engineer at TechCorp #").append(i)
                  .append(" email").append(i).append("@test.com phone +77011234567 ")
                  .append("Built microservices with Spring Boot and React. ");
            }
            String largeText = sb.toString();

            long start = System.currentTimeMillis();
            String masked = piiMasker.mask(largeText);
            long duration = System.currentTimeMillis() - start;

            assertThat(duration).isLessThan(2000);
            assertThat(masked).isNotEmpty();
            assertThat(masked).contains("Software Engineer");
            assertThat(masked).contains("Spring Boot");
            assertThat(masked).contains("[EMAIL]");
            assertThat(masked).contains("[PHONE]");
            assertThat(masked).doesNotContain("@test.com");
        }
    }

    // =========================================================================
    // 2. GROQCLIENT JSON EXTRACTOR ADVERSARIAL SUITE
    // =========================================================================
    @Nested
    @DisplayName("Adversarial Challenge: GroqClient.extractJson")
    class GroqJsonExtractorEdgeCaseTests {
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Test
        @DisplayName("Edge Case: Conversational preambles, markdown uppercase ```JSON, trailing conversational text")
        void testConversationalWithUppercaseMarkdown() throws Exception {
            String input = 
                "Certainly! Here is the structured JSON object for your request:\n\n" +
                "```JSON\n" +
                "{\n" +
                "  \"name\": \"Murat\",\n" +
                "  \"skills\": [\"Java\", \"Spring Boot\"],\n" +
                "  \"metrics\": {\"score\": 95}\n" +
                "}\n" +
                "```\n\n" +
                "Please let me know if you need any adjustments to these metrics!";

            String extracted = GroqClient.extractJson(input);
            JsonNode parsed = objectMapper.readTree(extracted);

            assertThat(parsed.get("name").asText()).isEqualTo("Murat");
            assertThat(parsed.get("skills").get(0).asText()).isEqualTo("Java");
            assertThat(parsed.get("metrics").get("score").asInt()).isEqualTo(95);
        }

        @Test
        @DisplayName("Edge Case: JSON object with string values containing curly braces and brackets (no internal markdown)")
        void testJsonContainingNestedBracesInsideStrings() throws Exception {
            String input = 
                "```json\n" +
                "{\n" +
                "  \"coverLetter\": \"Dear Team,\\nI am writing to express my interest.\\nKey skill: {Java} and [Spring].\\nRegards,\",\n" +
                "  \"version\": \"1.0.0\"\n" +
                "}\n" +
                "```";

            String extracted = GroqClient.extractJson(input);
            JsonNode parsed = objectMapper.readTree(extracted);

            assertThat(parsed.has("coverLetter")).isTrue();
            assertThat(parsed.get("coverLetter").asText()).contains("{Java} and [Spring]");
            assertThat(parsed.get("version").asText()).isEqualTo("1.0.0");
        }

        @Test
        @DisplayName("Edge Case Failure Demonstration: JSON containing embedded markdown fences ``` triggers premature truncation bug")
        void demonstrateEmbeddedMarkdownFenceBug() {
            String inputWithInternalBackticks = 
                "```json\n" +
                "{\n" +
                "  \"suggestions\": \"### Code Example\\n```java\\nSystem.out.println(1);\\n```\\nDone.\"\n" +
                "}\n" +
                "```";

            String extracted = GroqClient.extractJson(inputWithInternalBackticks);
            
            // Due to indexOf("```", firstBackticks + 3) instead of lastIndexOf("```"),
            // the extractor cuts at the first internal ```, causing truncated/invalid JSON.
            assertThatThrownBy(() -> objectMapper.readTree(extracted))
                    .isInstanceOf(Exception.class);
        }

        @Test
        @DisplayName("Edge Case: Raw JSON Array without markdown fences")
        void testRawJsonArrayWithoutFences() throws Exception {
            String input = "Here are the results: [{\"id\": 1, \"title\": \"Backend\"}, {\"id\": 2, \"title\": \"Frontend\"}] generated by LLM.";

            String extracted = GroqClient.extractJson(input);
            JsonNode parsed = objectMapper.readTree(extracted);

            assertThat(parsed.isArray()).isTrue();
            assertThat(parsed.size()).isEqualTo(2);
            assertThat(parsed.get(0).get("title").asText()).isEqualTo("Backend");
            assertThat(parsed.get(1).get("title").asText()).isEqualTo("Frontend");
        }

        @Test
        @DisplayName("Edge Case: Malformed or non-JSON conversational text returns raw or default fallback without crash")
        void testNonJsonTextHandling() {
            String input = "I apologize, but I cannot fulfill this request due to missing data.";
            String extracted = GroqClient.extractJson(input);
            assertThat(extracted).isEqualTo("I apologize, but I cannot fulfill this request due to missing data.");

            assertThat(GroqClient.extractJson(null)).isEqualTo("{}");
            assertThat(GroqClient.extractJson("")).isEqualTo("{}");
            assertThat(GroqClient.extractJson("   \n\t  ")).isEqualTo("{}");
        }

        @Test
        @DisplayName("Edge Case: Complex nested structures with Cyrillic strings inside JSON")
        void testCyrillicInsideJson() throws Exception {
            String input = 
                "```json\n" +
                "{\n" +
                "  \"score\": 90,\n" +
                "  \"feedback\": \"Отличное резюме. Ұсыныстар: Docker және Kubernetes тәжірибесін қосу керек.\",\n" +
                "  \"roles\": [\"Тимлид\", \"Инженер-программист\"]\n" +
                "}\n" +
                "```";

            String extracted = GroqClient.extractJson(input);
            JsonNode parsed = objectMapper.readTree(extracted);

            assertThat(parsed.get("score").asInt()).isEqualTo(90);
            assertThat(parsed.get("feedback").asText()).contains("Отличное резюме");
            assertThat(parsed.get("feedback").asText()).contains("Ұсыныстар");
            assertThat(parsed.get("roles").get(0).asText()).isEqualTo("Тимлид");
        }
    }

    // =========================================================================
    // 3. CYRILLIC RENDERING ACROSS ALL 6 RESUME TEMPLATES
    // =========================================================================
    @Nested
    @DisplayName("Adversarial Challenge: Cyrillic PDF Rendering (Russian & Kazakh)")
    class CyrillicPdfStressTests {

        private SpringTemplateEngine templateEngine;
        private List<String> fontPaths = new ArrayList<>();
        private ProfileDto fullCyrillicProfile;
        private ProfileDto minimalCyrillicProfile;

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

            fullCyrillicProfile = new ProfileDto();
            fullCyrillicProfile.setFullName("Мұрат Ғаниұлы Орынбасар (Әбілқайыр)");
            fullCyrillicProfile.setGithubUsername("MrSgemaSeny");
            fullCyrillicProfile.setLocation("Қазақстан Республикасы, Алматы қ., Өскемен / Шымкент");
            fullCyrillicProfile.setWebsite("https://medev.dev");
            fullCyrillicProfile.setLinkedin("https://linkedin.com/in/muratorynbasar");
            fullCyrillicProfile.setTelegram("@sgemaseny");
            fullCyrillicProfile.setSummary(
                "Тәжірибелі жетекші инженер-бағдарламашы және жүйелік сәулетші (Architect). " +
                "Жоғары жүктемелі B2B жүйелерді жобалау, микросервистік архитектура және жасанды интеллект (AI) интеграциясы. " +
                "Специализация: разработка высоконагруженных платформ на Java 17 / Spring Boot 3.3, PostgreSQL (pgvector) и React 19."
            );

            ExperienceDto exp1 = new ExperienceDto();
            exp1.setPosition("Бас бағдарламашы / Тимлид (Lead Software Engineer)");
            exp1.setCompany("«ЖанФинанс» ЖШС (ТОО ZhanFinance)");
            exp1.setStartDate(LocalDate.of(2025, 6, 1));
            exp1.setIsCurrent(true);
            exp1.setDescription(
                "B2B SaaS қаржылық CRM жүйесінің толық сәулетін нөлден құру. 6 деңгейлі рөлдік басқару (RBAC), " +
                "Flyway дерекқор миграциялары (V1-V108), нақты уақыттағы STOMP хабарламалар жүйесі. " +
                "Разработка ядра микросервисов с интеграцией Kaspi Pay и Stripe API. Бюджет: 15 000 000 ₸."
            );
            exp1.setTechStack("Java 17, Spring Boot 3.3, PostgreSQL, Redis, Docker, React 19, TailwindCSS");

            ExperienceDto exp2 = new ExperienceDto();
            exp2.setPosition("Аға инженер (Senior Full-Stack Developer)");
            exp2.setCompany("testCinema Ұлттық Киноплатформасы");
            exp2.setStartDate(LocalDate.of(2024, 9, 1));
            exp2.setEndDate(LocalDate.of(2025, 5, 31));
            exp2.setIsCurrent(false);
            exp2.setDescription("Қазақстандық сандық фильмдер мен медиа контентті таратуға арналған онлайн платформа.");
            exp2.setTechStack("Java, Python, FastAPI, Docker, TypeScript, PostgreSQL");

            fullCyrillicProfile.setExperience(List.of(exp1, exp2));

            EducationDto edu1 = new EducationDto();
            edu1.setInstitution("Сүлеймен Демирел атындағы Университет (SDU University)");
            edu1.setDegree("Ғылым бакалавры (Bachelor of Science)");
            edu1.setField("Ақпараттық жүйелер және бағдарламалық қамтамасыз ету (CS)");
            edu1.setStartDate(LocalDate.of(2022, 9, 1));
            edu1.setEndDate(LocalDate.of(2026, 6, 1));
            edu1.setIsCurrent(false);

            fullCyrillicProfile.setEducation(List.of(edu1));

            SkillDto s1 = new SkillDto();
            s1.setName("Java 17 / Spring Boot 3.3");
            s1.setCategory("Бэкенд және Сәулет (Backend)");

            SkillDto s2 = new SkillDto();
            s2.setName("PostgreSQL, Redis & pgvector");
            s2.setCategory("Дерекқорлар (Databases)");

            SkillDto s3 = new SkillDto();
            s3.setName("React 19, TypeScript & Tailwind");
            s3.setCategory("Фронтенд (Frontend)");

            SkillDto s4 = new SkillDto();
            s4.setName("Docker, Kubernetes & CI/CD");
            s4.setCategory("Инфрақұрылым (DevOps)");

            fullCyrillicProfile.setSkills(List.of(s1, s2, s3, s4));

            LanguageDto lang1 = new LanguageDto();
            lang1.setName("Қазақ тілі");
            lang1.setLevel("Ана тілі (Native)");

            LanguageDto lang2 = new LanguageDto();
            lang2.setName("Орыс тілі (Русский язык)");
            lang2.setLevel("Еркін меңгерген (C2)");

            LanguageDto lang3 = new LanguageDto();
            lang3.setName("Ағылшын тілі (English)");
            lang3.setLevel("Кәсіби жұмыс деңгейі (C1)");

            fullCyrillicProfile.setLanguages(List.of(lang1, lang2, lang3));

            ProjectDto proj1 = new ProjectDto();
            proj1.setName("MeDev Платформасы (IT мамандар портфолиосы)");
            proj1.setDescription("Түйіндеме жасау және карьераны басқаруға арналған жасанды интеллект жүйесі.");
            proj1.setGithubUrl("https://github.com/MrSgemaSeny/MeDev");
            proj1.setLiveUrl("https://medev.dev");
            proj1.setTechStack("Java 17, Spring Boot, React 19, Tailwind");
            proj1.setIsVisible(true);

            fullCyrillicProfile.setProjects(List.of(proj1));
            fullCyrillicProfile.setSectionOrder(List.of("summary", "experience", "education", "skills", "languages", "projects"));

            minimalCyrillicProfile = new ProfileDto();
            minimalCyrillicProfile.setFullName("Әлихан Бөкейхан");
            minimalCyrillicProfile.setLocation("Астана, Қазақстан");
            minimalCyrillicProfile.setSummary("Жас маман, бағдарламалаушы.");

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
                        String prefix = fontFile.substring(0, fontFile.lastIndexOf("."));
                        Path tempFile = Files.createTempFile(prefix, ".ttf");
                        tempFile.toFile().deleteOnExit();
                        Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
                        fontPaths.add(tempFile.toAbsolutePath().toString());
                    }
                }
            }
        }

        private Context createThymeleafContext(ProfileDto profile, boolean singlePage) {
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

        @ParameterizedTest(name = "Cyrillic PDF Strict Render: {0} (Single-Page)")
        @ValueSource(strings = {"clean", "github", "apple-modern", "grok-monolith", "milky-soft", "phub-orange"})
        @DisplayName("Verify valid PDF generation with extensive Kazakh/Russian Cyrillic across all 6 themes (Single-Page)")
        void testAllSixTemplatesCyrillicPdfSinglePage(String templateName) {
            Context context = createThymeleafContext(fullCyrillicProfile, true);
            String html = templateEngine.process("resume/" + templateName, context);

            assertThat(html).isNotBlank();
            assertThat(html).contains("Мұрат Ғаниұлы Орынбасар");

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

        @ParameterizedTest(name = "Cyrillic PDF Strict Render: {0} (Multi-Page)")
        @ValueSource(strings = {"clean", "github", "apple-modern", "grok-monolith", "milky-soft", "phub-orange"})
        @DisplayName("Verify valid PDF generation with extensive Kazakh/Russian Cyrillic across all 6 themes (Multi-Page)")
        void testAllSixTemplatesCyrillicPdfMultiPage(String templateName) {
            Context context = createThymeleafContext(fullCyrillicProfile, false);
            String html = templateEngine.process("resume/" + templateName, context);

            assertThat(html).isNotBlank();
            assertThat(html).contains("Мұрат Ғаниұлы Орынбасар");

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

        @ParameterizedTest(name = "Minimal Cyrillic PDF: {0}")
        @ValueSource(strings = {"clean", "github", "apple-modern", "grok-monolith", "milky-soft", "phub-orange"})
        @DisplayName("Verify template resilience with sparse/minimal Cyrillic profile (null fields)")
        void testMinimalCyrillicPdf(String templateName) {
            Context context = createThymeleafContext(minimalCyrillicProfile, true);
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

    // =========================================================================
    // 4. PRO GATE ACCESS CONTROLS SUITE
    // =========================================================================
    @Nested
    @DisplayName("Adversarial Challenge: PRO Gating Controls")
    class ProGateAccessControlTests {

        @Mock
        private LlmProvider llmProvider;
        @Mock
        private SubscriptionService subscriptionService;
        @Mock
        private ProfileService profileService;
        @Mock
        private VectorStore vectorStore;
        @Mock
        private UserRepository userRepository;
        @Mock
        private PdfGeneratorService pdfGeneratorService;

        private ObjectMapper objectMapper = new ObjectMapper();
        private AiApplicationService aiApplicationService;
        private ResumeController resumeController;
        private MockMvc resumeMockMvc;

        @BeforeEach
        void setUp() {
            aiApplicationService = new AiApplicationService(
                    llmProvider, objectMapper, subscriptionService, profileService, vectorStore
            );

            resumeController = new ResumeController(pdfGeneratorService, userRepository);
            resumeMockMvc = MockMvcBuilders.standaloneSetup(resumeController)
                    .setControllerAdvice(new com.medev.shared.exception.GlobalExceptionHandler())
                    .build();

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(10L, null, List.of());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        @Test
        @DisplayName("PRO Gate: AiApplicationService matchJob, generateCoverLetter, tailorResume block FREE user")
        void testAiApplicationServiceRejectsFreeUser() {
            Long freeUserId = 10L;
            doThrow(new ForbiddenException("Requires PRO")).when(subscriptionService).assertPro(freeUserId);

            // matchJob
            assertThatThrownBy(() -> aiApplicationService.matchJob(freeUserId, "Senior Java Engineer"))
                    .isInstanceOf(ForbiddenException.class);

            // generateCoverLetter
            AiApplicationRequest req = new AiApplicationRequest();
            req.setJobDescription("Java Dev");
            assertThatThrownBy(() -> aiApplicationService.generateCoverLetter(freeUserId, req))
                    .isInstanceOf(ForbiddenException.class);

            // tailorResume
            assertThatThrownBy(() -> aiApplicationService.tailorResume(freeUserId, req))
                    .isInstanceOf(ForbiddenException.class);

            verify(subscriptionService, times(3)).assertPro(freeUserId);
            verifyNoInteractions(llmProvider);
        }

        @Test
        @DisplayName("PRO Gate: ResumeController blocks FREE user on PRO templates when preview=false")
        void testResumeControllerBlocksProTemplatesForFreeUser() throws Exception {
            User freeUser = User.builder().id(10L).plan(User.Plan.FREE).build();
            when(userRepository.findById(10L)).thenReturn(Optional.of(freeUser));

            // Pro templates: apple-modern, milky-soft, phub-orange
            resumeMockMvc.perform(get("/v1/resume/generate/apple-modern").param("preview", "false"))
                    .andExpect(status().isForbidden());

            resumeMockMvc.perform(get("/v1/resume/generate/milky-soft").param("preview", "false"))
                    .andExpect(status().isForbidden());

            resumeMockMvc.perform(get("/v1/resume/generate/phub-orange").param("preview", "false"))
                    .andExpect(status().isForbidden());

            resumeMockMvc.perform(get("/v1/resume/html/apple-modern").param("preview", "false"))
                    .andExpect(status().isForbidden());

            verifyNoInteractions(pdfGeneratorService);
        }

        @Test
        @DisplayName("PRO Gate: ResumeController permits FREE user on PRO templates when preview=true")
        void testResumeControllerAllowsPreviewForFreeUser() throws Exception {
            when(pdfGeneratorService.generatePdf(eq(10L), eq("apple-modern"), eq(true), anyBoolean()))
                    .thenReturn(new byte[]{1, 2, 3});
            when(pdfGeneratorService.generateHtml(eq(10L), eq("apple-modern"), eq(true), anyBoolean()))
                    .thenReturn("<html>Preview</html>");

            resumeMockMvc.perform(get("/v1/resume/generate/apple-modern").param("preview", "true"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition", "inline; filename=resume.pdf"));

            resumeMockMvc.perform(get("/v1/resume/html/apple-modern").param("preview", "true"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition", "inline; filename=resume.html"));
        }

        @Test
        @DisplayName("PRO Gate: ResumeController permits FREE user on Free templates (clean, github, grok-monolith) for full download")
        void testResumeControllerAllowsFreeTemplatesForFreeUser() throws Exception {
            when(pdfGeneratorService.generatePdf(eq(10L), eq("clean"), eq(false), anyBoolean()))
                    .thenReturn(new byte[]{1, 2, 3});
            when(pdfGeneratorService.generatePdf(eq(10L), eq("github"), eq(false), anyBoolean()))
                    .thenReturn(new byte[]{1, 2, 3});
            when(pdfGeneratorService.generatePdf(eq(10L), eq("grok-monolith"), eq(false), anyBoolean()))
                    .thenReturn(new byte[]{1, 2, 3});

            resumeMockMvc.perform(get("/v1/resume/generate/clean").param("preview", "false"))
                    .andExpect(status().isOk());

            resumeMockMvc.perform(get("/v1/resume/generate/github").param("preview", "false"))
                    .andExpect(status().isOk());

            resumeMockMvc.perform(get("/v1/resume/generate/grok-monolith").param("preview", "false"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("PRO Gate: ResumeController permits PRO user on all templates without restrictions")
        void testResumeControllerAllowsProUserOnAllTemplates() throws Exception {
            User proUser = User.builder().id(10L).plan(User.Plan.PRO).build();
            when(userRepository.findById(10L)).thenReturn(Optional.of(proUser));

            when(pdfGeneratorService.generatePdf(eq(10L), anyString(), eq(false), anyBoolean()))
                    .thenReturn(new byte[]{1, 2, 3});

            for (String template : List.of("apple-modern", "milky-soft", "phub-orange")) {
                resumeMockMvc.perform(get("/v1/resume/generate/" + template).param("preview", "false"))
                        .andExpect(status().isOk());
            }
        }
    }
}
