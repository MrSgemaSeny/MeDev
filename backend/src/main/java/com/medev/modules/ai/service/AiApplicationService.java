package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.dto.AiApplicationRequest;
import com.medev.modules.ai.dto.AiApplicationResponse;
import com.medev.modules.billing.service.SubscriptionService;
import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AiApplicationService extends AbstractAiStructuredService {

    private final SubscriptionService subscriptionService;
    private final ProfileService profileService;
    private final org.springframework.ai.vectorstore.VectorStore vectorStore;

    public AiApplicationService(
            LlmProvider llmProvider,
            ObjectMapper objectMapper,
            SubscriptionService subscriptionService,
            ProfileService profileService,
            org.springframework.ai.vectorstore.VectorStore vectorStore) {
        super(llmProvider, objectMapper);
        this.subscriptionService = subscriptionService;
        this.profileService = profileService;
        this.vectorStore = vectorStore;
    }

    public AiApplicationResponse generateCoverLetter(Long userId, AiApplicationRequest request) {
        subscriptionService.assertPro(userId);
        ProfileDto profile = profileService.getByUserId(userId);
        
        String profileJson;
        try {
            profileJson = objectMapper.writeValueAsString(profile);
        } catch (Exception e) {
            log.error("Failed to serialize profile", e);
            throw new RuntimeException("Failed to process profile data", e);
        }

        // RAG: Retrieve top 4 most relevant experiences/projects for this job description
        org.springframework.ai.vectorstore.SearchRequest searchRequest = org.springframework.ai.vectorstore.SearchRequest.query(request.getJobDescription())
                .withTopK(4)
                .withFilterExpression("userId == '" + userId + "'");
        
        java.util.List<org.springframework.ai.document.Document> relevantDocs = vectorStore.similaritySearch(searchRequest);
        String relevantContext = relevantDocs.stream()
                .map(org.springframework.ai.document.Document::getContent)
                .collect(java.util.stream.Collectors.joining("\n- "));

        String systemPrompt = "You are an expert technical recruiter and career coach. Write a highly professional and tailored cover letter. Output JSON in format: {\"coverLetter\": \"<text>\"}";
        String userMessage = String.format(
            "Candidate's Most Relevant Experience & Projects (Retrieved via AI Search):\n- %s\n\nJob Description:\n%s\n\nTarget Role: %s\n\nBase your cover letter heavily on these specific relevant experiences.",
            relevantContext.isEmpty() ? "No specific data found. Use generic developer skills." : relevantContext, 
            request.getJobDescription(), 
            request.getTargetRole() != null ? request.getTargetRole() : "Software Engineer"
        );

        JsonNode root = generateStructuredData(systemPrompt, userMessage, JsonNode.class);
        if (root != null && root.has("coverLetter")) {
            return new AiApplicationResponse(root.get("coverLetter").asText());
        }
        throw new RuntimeException("AI generated invalid structure: missing 'coverLetter'");
    }

    public AiApplicationResponse tailorResume(Long userId, AiApplicationRequest request) {
        subscriptionService.assertPro(userId);
        ProfileDto profile = profileService.getByUserId(userId);
        
        String profileJson;
        try {
            profileJson = objectMapper.writeValueAsString(profile);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process profile data", e);
        }

        org.springframework.ai.vectorstore.SearchRequest searchRequest = org.springframework.ai.vectorstore.SearchRequest.query(request.getJobDescription())
                .withTopK(5)
                .withFilterExpression("userId == '" + userId + "'");
        
        java.util.List<org.springframework.ai.document.Document> relevantDocs = vectorStore.similaritySearch(searchRequest);
        String relevantContext = relevantDocs.stream()
                .map(org.springframework.ai.document.Document::getContent)
                .collect(java.util.stream.Collectors.joining("\n- "));

        String systemPrompt = "You are an expert technical resume writer. Rewrite the candidate's resume summary and experience to align with the JD. Output JSON in format: {\"suggestions\": \"<markdown text>\"}";
        String userMessage = String.format(
            "Candidate's Most Relevant Experience & Projects (Retrieved via AI Search):\n- %s\n\nJob Description:\n%s",
            relevantContext.isEmpty() ? "No specific data found." : relevantContext, 
            request.getJobDescription()
        );

        JsonNode root = generateStructuredData(systemPrompt, userMessage, JsonNode.class);
        if (root != null && root.has("suggestions")) {
            return new AiApplicationResponse(root.get("suggestions").asText());
        }
        throw new RuntimeException("AI generated invalid structure: missing 'suggestions'");
    }

    public com.medev.modules.ai.dto.AiMatchResponse matchJob(Long userId, String jobDescription) {
        subscriptionService.assertPro(userId);
        ProfileDto profile = profileService.getByUserId(userId);
        
        String profileJson;
        try {
            profileJson = objectMapper.writeValueAsString(profile);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process profile data", e);
        }

        String systemPrompt = "You are an expert technical recruiter. Evaluate how well the candidate's profile matches the job description. Provide a match score from 0 to 100 and brief constructive feedback on missing skills. Output JSON in format: {\"score\": 85, \"feedback\": \"<text>\"}";
        String userMessage = String.format(
            "Candidate Profile:\n%s\n\nJob Description:\n%s",
            profileJson, 
            jobDescription
        );

        JsonNode root = generateStructuredData(systemPrompt, userMessage, JsonNode.class);
        if (root != null && root.has("score") && root.has("feedback")) {
            return new com.medev.modules.ai.dto.AiMatchResponse(
                root.get("score").asInt(),
                root.get("feedback").asText()
            );
        }
        throw new RuntimeException("AI generated invalid structure: missing 'score' or 'feedback'");
    }
}

