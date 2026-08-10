package com.medev.modules.resume.service;

import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PdfGeneratorServiceTest {

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private ProfileService profileService;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private PdfGeneratorService pdfGeneratorService;

    @Test
    void generatePdf_happyPath() {
        Long userId = 1L;
        String templateName = "modern";
        String validHtml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n" +
                "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head><title>Test</title></head><body><p>Hello</p></body></html>";

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(profileService.getByUserId(userId)).thenReturn(new ProfileDto());
        when(templateEngine.process(eq("resume/" + templateName), any(Context.class))).thenReturn(validHtml);

        byte[] result = pdfGeneratorService.generatePdf(userId, templateName);

        assertThat(result).isNotEmpty();
        verify(valueOperations).increment(anyString());
        verify(redisTemplate).expire(anyString(), any(Duration.class));
    }

    @Test
    void generatePdf_underLimit_incrementsCounter() {
        Long userId = 1L;
        String templateName = "modern";
        String validHtml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n" +
                "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head><title>Test</title></head><body><p>Hello</p></body></html>";

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(2);
        when(profileService.getByUserId(userId)).thenReturn(new ProfileDto());
        when(templateEngine.process(eq("resume/" + templateName), any(Context.class))).thenReturn(validHtml);

        byte[] result = pdfGeneratorService.generatePdf(userId, templateName);

        assertThat(result).isNotEmpty();
        verify(valueOperations).increment(anyString());
        verify(redisTemplate).expire(anyString(), any(Duration.class));
    }

    @Test
    void generatePdf_limitReached_throwsTooManyRequests() {
        Long userId = 1L;
        String templateName = "modern";

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(50);

        assertThatThrownBy(() -> pdfGeneratorService.generatePdf(userId, templateName))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Daily generation limit reached");
    }

    @Test
    void generatePdf_renderError_throwsRuntimeException() {
        Long userId = 1L;
        String templateName = "modern";
        String invalidHtml = "<html><body>Missing closing tags";

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(profileService.getByUserId(userId)).thenReturn(new ProfileDto());
        when(templateEngine.process(eq("resume/" + templateName), any(Context.class))).thenReturn(invalidHtml);

        assertThatThrownBy(() -> pdfGeneratorService.generatePdf(userId, templateName))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("PDF generation failed");
    }
}
