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

        if (profile.getLanguages() != null) {
            String languagesStr = profile.getLanguages().stream()
                    .map(l -> l.getName() + (l.getLevel() != null && !l.getLevel().isBlank() ? " (" + l.getLevel() + ")" : ""))
                    .collect(java.util.stream.Collectors.joining(", "));
            context.setVariable("languagesStr", languagesStr);
        }
        String html = templateEngine.process("resume/" + templateName, context);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ITextRenderer renderer = new ITextRenderer();
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
}
