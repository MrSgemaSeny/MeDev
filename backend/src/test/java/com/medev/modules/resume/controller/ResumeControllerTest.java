package com.medev.modules.resume.controller;

import com.medev.modules.resume.service.PdfGeneratorService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ResumeControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PdfGeneratorService pdfGeneratorService;

    @Mock
    private com.medev.modules.auth.repository.UserRepository userRepository;

    @InjectMocks
    private ResumeController resumeController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(resumeController)
                .setControllerAdvice(new com.medev.shared.exception.GlobalExceptionHandler())
                .build();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(1L, null, java.util.Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void generateHtml_freeTemplate_clean_returnsHtml() throws Exception {
        when(pdfGeneratorService.generateHtml(eq(1L), eq("clean"), anyBoolean(), anyBoolean()))
                .thenReturn("<html><body>Clean Resume</body></html>");

        mockMvc.perform(get("/v1/resume/html/clean"))
                .andExpect(status().isOk())
                .andExpect(content().string("<html><body>Clean Resume</body></html>"));
    }

    @Test
    void generateHtml_freeTemplate_github_returnsHtml() throws Exception {
        when(pdfGeneratorService.generateHtml(eq(1L), eq("github"), anyBoolean(), anyBoolean()))
                .thenReturn("<html><body>GitHub Resume</body></html>");

        mockMvc.perform(get("/v1/resume/html/github"))
                .andExpect(status().isOk())
                .andExpect(content().string("<html><body>GitHub Resume</body></html>"));
    }

    @Test
    void generatePdf_freeTemplate_clean_returnsPdfBytes() throws Exception {
        byte[] samplePdf = new byte[]{1, 2, 3, 4};
        when(pdfGeneratorService.generatePdf(eq(1L), eq("clean"), anyBoolean(), anyBoolean()))
                .thenReturn(samplePdf);

        mockMvc.perform(get("/v1/resume/generate/clean"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(content().bytes(samplePdf));
    }

    @Test
    void generateHtml_appleModern_succeedsForAllUsers() throws Exception {
        when(pdfGeneratorService.generateHtml(eq(1L), eq("apple-modern"), anyBoolean(), anyBoolean()))
                .thenReturn("<html><body>Apple Resume</body></html>");

        mockMvc.perform(get("/v1/resume/html/apple-modern"))
                .andExpect(status().isOk())
                .andExpect(content().string("<html><body>Apple Resume</body></html>"));
    }

    @Test
    void generateHtml_invalidTemplate_returnsBadRequest() throws Exception {
        mockMvc.perform(get("/v1/resume/html/non-existent-template"))
                .andExpect(status().isBadRequest());
    }
}