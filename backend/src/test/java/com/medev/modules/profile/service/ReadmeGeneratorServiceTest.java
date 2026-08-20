package com.medev.modules.profile.service;

import com.medev.modules.profile.dto.ProfileDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReadmeGeneratorServiceTest {

    @Mock
    private TemplateEngine textTemplateEngine;

    @InjectMocks
    private ReadmeGeneratorService readmeGeneratorService;

    @Test
    void generateReadme_rendersProfileData() {
        ReflectionTestUtils.setField(readmeGeneratorService, "textTemplateEngine", textTemplateEngine);
        when(textTemplateEngine.process(anyString(), any(Context.class))).thenReturn("Mocked README content");

        ProfileDto profile = ProfileDto.builder()
                .fullName("John Doe")
                .headline("Software Engineer")
                .summary("A great developer")
                .location("New York")
                .githubUsername("johndoe")
                .build();

        String result = readmeGeneratorService.generateReadme(profile);

        assertThat(result).isEqualTo("Mocked README content");
    }

    @Test
    void generateReadme_withTemplates() {
        ReflectionTestUtils.setField(readmeGeneratorService, "textTemplateEngine", textTemplateEngine);
        when(textTemplateEngine.process(anyString(), any(Context.class))).thenReturn("Template content");

        ProfileDto profile = ProfileDto.builder().fullName("John").build();

        assertThat(readmeGeneratorService.generateReadme(profile, "minimal")).isEqualTo("Template content");
        assertThat(readmeGeneratorService.generateReadme(profile, "creative")).isEqualTo("Template content");
        assertThat(readmeGeneratorService.generateReadme(profile, "full")).isEqualTo("Template content");
    }

    @Test
    void generateReadme_withNullFields_doesNotThrow() {
        ReflectionTestUtils.setField(readmeGeneratorService, "textTemplateEngine", textTemplateEngine);
        when(textTemplateEngine.process(anyString(), any(Context.class))).thenReturn("Mocked");

        ProfileDto profile = ProfileDto.builder().build();

        assertThatCode(() -> readmeGeneratorService.generateReadme(profile))
                .doesNotThrowAnyException();
    }
}
