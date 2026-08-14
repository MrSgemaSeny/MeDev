package com.medev.modules.resume.service;

import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.service.ProfileService;
import com.medev.shared.exception.TooManyRequestsException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PdfGeneratorService {

    private final TemplateEngine templateEngine;
    private final ProfileService profileService;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final int FREE_DAILY_LIMIT = 50;
    
    private java.util.List<String> registeredFontPaths = new java.util.ArrayList<>();

    @jakarta.annotation.PostConstruct
    public void initFonts() {
        String[] fontFiles = {
            "Roboto-Regular.ttf", "Roboto-Bold.ttf",
            "Inter-Regular.ttf", "Inter-Medium.ttf", "Inter-SemiBold.ttf", "Inter-Bold.ttf", "Inter-ExtraBold.ttf",
            "SpaceGrotesk-Regular.ttf", "SpaceGrotesk-Medium.ttf", "SpaceGrotesk-SemiBold.ttf", "SpaceGrotesk-Bold.ttf",
            "Lora-Regular.ttf", "Lora-Italic.ttf", "Lora-SemiBold.ttf",
            "PlayfairDisplay-SemiBold.ttf", "PlayfairDisplay-Bold.ttf",
            "Anton-Regular.ttf"
        };

        for (String fontFile : fontFiles) {
            try {
                org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource("fonts/" + fontFile);
                if (!resource.exists()) {
                    System.err.println("WARN: Font " + fontFile + " not found in classpath. Skipping.");
                    continue;
                }
                
                String prefix = fontFile.substring(0, fontFile.lastIndexOf('.'));
                java.nio.file.Path tempFile = java.nio.file.Files.createTempFile(prefix, ".ttf");
                tempFile.toFile().deleteOnExit();
                
                try (java.io.InputStream in = resource.getInputStream()) {
                    java.nio.file.Files.copy(in, tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                }
                
                registeredFontPaths.add(tempFile.toAbsolutePath().toString());
            } catch (Exception e) {
                System.err.println("ERROR: Failed to extract font " + fontFile + ": " + e.getMessage());
            }
        }
    }

    public byte[] generatePdf(Long userId, String templateName) {
        checkGenerationLimit(userId);

        ProfileDto profile = profileService.getByUserId(userId);

        Context context = new Context();
        context.setVariable("profile", profile);
        context.setVariable("generatedAt", LocalDate.now());
        
        if (profile.getSkills() != null) {
            java.util.Map<String, java.util.List<String>> groupedSkills = profile.getSkills().stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            s -> s.getCategory() != null && !s.getCategory().isBlank() ? s.getCategory() : "General",
                            java.util.stream.Collectors.mapping(com.medev.modules.profile.dto.SkillDto::getName, java.util.stream.Collectors.toList())
                    ));
            context.setVariable("groupedSkills", groupedSkills);
        }

        if (profile.getGithubUsername() != null && !profile.getGithubUsername().isBlank()) {
            context.setVariable("avatarBase64", fetchAvatarBase64(profile.getGithubUsername()));
        }

        if (profile.getLanguages() != null) {
            String languagesStr = profile.getLanguages().stream()
                    .map(l -> l.getName() + (l.getLevel() != null && !l.getLevel().isBlank() && !l.getLevel().equalsIgnoreCase("not specified") ? " (" + l.getLevel() + ")" : ""))
                    .collect(java.util.stream.Collectors.joining(", "));
            context.setVariable("languagesStr", languagesStr);
        }
        String html = templateEngine.process("resume/" + templateName, context);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
            
            try {
                for (String fontPath : registeredFontPaths) {
                    renderer.getFontResolver().addFont(fontPath, "Identity-H", true);
                }
            } catch (Exception fontEx) {
                throw new RuntimeException("PDF font loading failed", fontEx);
            }

            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(out);
            renderer.finishPDF();

            incrementGenerationCount(userId);

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage());
        }
    }

    public String generateHtml(Long userId, String templateName) {
        checkGenerationLimit(userId);

        ProfileDto profile = profileService.getByUserId(userId);

        Context context = new Context();
        context.setVariable("profile", profile);
        context.setVariable("generatedAt", LocalDate.now());
        
        if (profile.getSkills() != null) {
            java.util.Map<String, java.util.List<String>> groupedSkills = profile.getSkills().stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            s -> s.getCategory() != null && !s.getCategory().isBlank() ? s.getCategory() : "General",
                            java.util.stream.Collectors.mapping(com.medev.modules.profile.dto.SkillDto::getName, java.util.stream.Collectors.toList())
                    ));
            context.setVariable("groupedSkills", groupedSkills);
        }

        if (profile.getGithubUsername() != null && !profile.getGithubUsername().isBlank()) {
            context.setVariable("avatarBase64", fetchAvatarBase64(profile.getGithubUsername()));
        }

        if (profile.getLanguages() != null) {
            String languagesStr = profile.getLanguages().stream()
                    .map(l -> l.getName() + (l.getLevel() != null && !l.getLevel().isBlank() && !l.getLevel().equalsIgnoreCase("not specified") ? " (" + l.getLevel() + ")" : ""))
                    .collect(java.util.stream.Collectors.joining(", "));
            context.setVariable("languagesStr", languagesStr);
        }
        String html = templateEngine.process("resume-html/" + templateName, context);
        incrementGenerationCount(userId);
        return html;
    }

    private void checkGenerationLimit(Long userId) {
        String key = "resume:gen:" + userId + ":" + LocalDate.now();
        Integer count = (Integer) redisTemplate.opsForValue().get(key);
        if (count != null && count >= FREE_DAILY_LIMIT) {
            throw new TooManyRequestsException("Daily generation limit reached. Upgrade to Pro.");
        }
    }

    private void incrementGenerationCount(Long userId) {
        String key = "resume:gen:" + userId + ":" + LocalDate.now();
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, Duration.ofDays(1));
    }

    private String fetchAvatarBase64(String githubUsername) {
        try {
            java.net.URL url = new java.net.URL("https://github.com/" + githubUsername + ".png");
            java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setConnectTimeout(3000);
            connection.setReadTimeout(3000);
            connection.setInstanceFollowRedirects(true);
            
            int status = connection.getResponseCode();
            if (status == java.net.HttpURLConnection.HTTP_MOVED_TEMP
                || status == java.net.HttpURLConnection.HTTP_MOVED_PERM
                || status == java.net.HttpURLConnection.HTTP_SEE_OTHER) {
                String newUrl = connection.getHeaderField("Location");
                connection = (java.net.HttpURLConnection) new java.net.URL(newUrl).openConnection();
                connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            }
            if (connection.getResponseCode() != 200) return null;

            try (java.io.InputStream in = connection.getInputStream();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[4096];
                int n;
                while ((n = in.read(buffer)) != -1) {
                    out.write(buffer, 0, n);
                }
                return "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(out.toByteArray());
            }
        } catch (Exception e) {
            return null;
        }
    }
}
