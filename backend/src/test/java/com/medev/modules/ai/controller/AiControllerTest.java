package com.medev.modules.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.dto.AiMatchResponse;
import com.medev.modules.ai.dto.AiParsedResumeDto;
import com.medev.modules.ai.dto.ChatRequest;
import com.medev.modules.ai.service.*;
import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.service.ProfileService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import reactor.core.publisher.Flux;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class AiControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AiAnalysisService aiAnalysisService;

    @Mock
    private AiAssistantService aiAssistantService;

    @Mock
    private AiContextService aiContextService;

    @Mock
    private AiGenerateService aiGenerateService;

    @Mock
    private AiOnboardingService aiOnboardingService;

    @Mock
    private AiApplicationService aiApplicationService;

    @Mock
    private AiRateLimiter aiRateLimiter;

    @Mock
    private ProfileService profileService;

    @Mock
    private EvaluationService evaluationService;

    @Mock
    private com.medev.modules.github.repository.GithubSnapshotRepository snapshotRepository;

    @InjectMocks
    private AiController aiController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(aiController)
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
    void parseResume_validPdf_returnsUpdatedProfile() throws Exception {
        byte[] validPdfBytes = "%PDF-1.4 mock content".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", validPdfBytes);

        ProfileDto currentProfile = new ProfileDto();
        AiParsedResumeDto parsedDto = new AiParsedResumeDto();
        ProfileDto updatedProfile = new ProfileDto();
        updatedProfile.setFullName("John Doe");

        when(profileService.getByUserId(1L)).thenReturn(currentProfile);
        when(aiAnalysisService.parseResumePdf(any(), eq(currentProfile))).thenReturn(parsedDto);
        when(profileService.importParsedResume(1L, parsedDto)).thenReturn(updatedProfile);

        mockMvc.perform(multipart("/v1/ai/parse-resume").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("John Doe"));

        verify(aiRateLimiter).checkAndConsume(1L);
        verify(aiAnalysisService).parseResumePdf(any(), eq(currentProfile));
    }

    @Test
    void parseResume_invalidMagicBytes_returnsBadRequest() throws Exception {
        byte[] invalidBytes = "NOT_A_PDF_CONTENT".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", invalidBytes);

        mockMvc.perform(multipart("/v1/ai/parse-resume").file(file))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(aiAnalysisService);
    }

    @Test
    void parseResume_nonPdfContentType_returnsBadRequest() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", "%PDF-dummy".getBytes());

        mockMvc.perform(multipart("/v1/ai/parse-resume").file(file))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(aiAnalysisService);
    }

    @Test
    void matchJob_validRequest_returnsMatchResponse() throws Exception {
        when(aiApplicationService.matchJob(eq(1L), eq("Looking for senior Java backend developer")))
                .thenReturn(new AiMatchResponse(92, "Excellent match for backend roles."));

        String requestBody = objectMapper.writeValueAsString(Map.of("jobDescription", "Looking for senior Java backend developer"));

        mockMvc.perform(post("/v1/ai/match-job")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(92))
                .andExpect(jsonPath("$.feedback").value("Excellent match for backend roles."));

        verify(aiRateLimiter).checkAndConsume(1L);
        verify(aiApplicationService).matchJob(1L, "Looking for senior Java backend developer");
    }

    @Test
    void matchJob_emptyJobDescription_returnsBadRequest() throws Exception {
        String requestBody = objectMapper.writeValueAsString(Map.of("jobDescription", "   "));

        mockMvc.perform(post("/v1/ai/match-job")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(aiApplicationService);
    }

    @Test
    void streamChat_happyPath_returnsSseEmitter() throws Exception {
        when(aiContextService.buildAssistantSystemPrompt(1L)).thenReturn("System prompt");
        when(aiAssistantService.streamChat(anyString(), anyString(), any()))
                .thenReturn(Flux.just("Hello", " world!"));

        ChatRequest request = new ChatRequest();
        request.setPrompt("Hello AI");

        MvcResult result = mockMvc.perform(post("/v1/ai/chat/stream")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getContentType()).contains("text/event-stream");
        verify(aiRateLimiter).checkAndConsume(1L);
    }
}
