package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.dto.AiApplicationRequest;
import com.medev.modules.ai.dto.AiApplicationResponse;
import com.medev.modules.ai.dto.AiMatchResponse;
import com.medev.modules.billing.service.SubscriptionService;
import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.service.ProfileService;
import com.medev.shared.exception.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AiApplicationServiceTest {

    @Mock
    private LlmProvider llmProvider;

    @Mock
    private SubscriptionService subscriptionService;

    @Mock
    private ProfileService profileService;

    @Mock
    private VectorStore vectorStore;

    private ObjectMapper objectMapper = new ObjectMapper();

    private AiApplicationService aiApplicationService;

    @BeforeEach
    void setUp() {
        aiApplicationService = new AiApplicationService(
                llmProvider,
                objectMapper,
                subscriptionService,
                profileService,
                vectorStore
        );
    }

    @Test
    void matchJob_nonProUser_throwsForbiddenException() {
        Long userId = 1L;
        doThrow(new ForbiddenException("Feature requires PRO plan")).when(subscriptionService).assertPro(userId);

        assertThatThrownBy(() -> aiApplicationService.matchJob(userId, "Looking for a Java Developer"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Feature requires PRO plan");

        verify(subscriptionService).assertPro(userId);
        verifyNoInteractions(profileService);
        verifyNoInteractions(llmProvider);
    }

    @Test
    void matchJob_proUser_happyPath() {
        Long userId = 1L;
        doNothing().when(subscriptionService).assertPro(userId);

        ProfileDto mockProfile = new ProfileDto();
        mockProfile.setFullName("John Developer");
        when(profileService.getByUserId(userId)).thenReturn(mockProfile);

        String llmOutput = "{\"score\": 88, \"feedback\": \"Strong backend match, recommended to highlight Docker experience.\"}";
        when(llmProvider.structuredCompletion(anyString(), anyString())).thenReturn(llmOutput);

        AiMatchResponse response = aiApplicationService.matchJob(userId, "Senior Spring Boot Engineer");

        assertThat(response).isNotNull();
        assertThat(response.getScore()).isEqualTo(88);
        assertThat(response.getFeedback()).isEqualTo("Strong backend match, recommended to highlight Docker experience.");

        verify(subscriptionService).assertPro(userId);
        verify(profileService).getByUserId(userId);
    }

    @Test
    void matchJob_llmReturnsIncompleteStructure_throwsRuntimeException() {
        Long userId = 1L;
        doNothing().when(subscriptionService).assertPro(userId);

        ProfileDto mockProfile = new ProfileDto();
        when(profileService.getByUserId(userId)).thenReturn(mockProfile);

        String llmOutput = "{\"invalidField\": 123}";
        when(llmProvider.structuredCompletion(anyString(), anyString())).thenReturn(llmOutput);

        assertThatThrownBy(() -> aiApplicationService.matchJob(userId, "Senior Developer"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("missing 'score' or 'feedback'");
    }

    @Test
    void generateCoverLetter_nonProUser_throwsForbiddenException() {
        Long userId = 2L;
        doThrow(new ForbiddenException("Feature requires PRO plan")).when(subscriptionService).assertPro(userId);

        AiApplicationRequest req = new AiApplicationRequest();
        req.setJobDescription("Job description here");
        req.setTargetRole("Tech Lead");

        assertThatThrownBy(() -> aiApplicationService.generateCoverLetter(userId, req))
                .isInstanceOf(ForbiddenException.class);

        verify(subscriptionService).assertPro(userId);
        verifyNoInteractions(llmProvider);
    }

    @Test
    void generateCoverLetter_proUser_happyPath() {
        Long userId = 2L;
        doNothing().when(subscriptionService).assertPro(userId);

        ProfileDto mockProfile = new ProfileDto();
        when(profileService.getByUserId(userId)).thenReturn(mockProfile);

        Document doc = new Document("Built high-scale Spring Boot payment service");
        when(vectorStore.similaritySearch(any(SearchRequest.class))).thenReturn(List.of(doc));

        String llmOutput = "{\"coverLetter\": \"Dear Hiring Team, I am excited to apply for the Tech Lead position...\"}";
        when(llmProvider.structuredCompletion(anyString(), anyString())).thenReturn(llmOutput);

        AiApplicationRequest req = new AiApplicationRequest();
        req.setJobDescription("Job description here");
        req.setTargetRole("Tech Lead");

        AiApplicationResponse response = aiApplicationService.generateCoverLetter(userId, req);

        assertThat(response).isNotNull();
        assertThat(response.getContent()).contains("Dear Hiring Team");
    }

    @Test
    void tailorResume_nonProUser_throwsForbiddenException() {
        Long userId = 3L;
        doThrow(new ForbiddenException("Feature requires PRO plan")).when(subscriptionService).assertPro(userId);

        AiApplicationRequest req = new AiApplicationRequest();
        req.setJobDescription("Job description here");
        req.setTargetRole("Senior Engineer");

        assertThatThrownBy(() -> aiApplicationService.tailorResume(userId, req))
                .isInstanceOf(ForbiddenException.class);

        verify(subscriptionService).assertPro(userId);
    }

    @Test
    void tailorResume_proUser_happyPath() {
        Long userId = 3L;
        doNothing().when(subscriptionService).assertPro(userId);

        ProfileDto mockProfile = new ProfileDto();
        when(profileService.getByUserId(userId)).thenReturn(mockProfile);

        Document doc = new Document("Experience with microservices and PostgreSQL");
        when(vectorStore.similaritySearch(any(SearchRequest.class))).thenReturn(List.of(doc));

        String llmOutput = "{\"suggestions\": \"### Tailored Summary\\nFocus on PostgreSQL and microservices.\"}";
        when(llmProvider.structuredCompletion(anyString(), anyString())).thenReturn(llmOutput);

        AiApplicationRequest req = new AiApplicationRequest();
        req.setJobDescription("Job description here");
        req.setTargetRole("Senior Engineer");

        AiApplicationResponse response = aiApplicationService.tailorResume(userId, req);

        assertThat(response).isNotNull();
        assertThat(response.getContent()).contains("Tailored Summary");
    }
}
