package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.dto.AiApplicationRequest;
import com.medev.modules.ai.dto.AiApplicationResponse;
import com.medev.modules.ai.dto.AiMatchResponse;
import com.medev.modules.ai.embedding.JinaEmbeddingClient;
import com.medev.modules.ai.embedding.PgVectorRepository;
import com.medev.modules.billing.service.SubscriptionService;
import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.service.ProfileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class AiApplicationService extends AbstractAiStructuredService {

    private final SubscriptionService subscriptionService;
    private final ProfileService profileService;
    private final JinaEmbeddingClient jinaEmbeddingClient;
    private final PgVectorRepository pgVectorRepository;

    public AiApplicationService(
            LlmProvider llmProvider,
            ObjectMapper objectMapper,
            SubscriptionService subscriptionService,
            ProfileService profileService,
            JinaEmbeddingClient jinaEmbeddingClient,
            PgVectorRepository pgVectorRepository) {
        super(llmProvider, objectMapper);
        this.subscriptionService = subscriptionService;
        this.profileService = profileService;
        this.jinaEmbeddingClient = jinaEmbeddingClient;
        this.pgVectorRepository = pgVectorRepository;
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
        String relevantContext = "";
        try {
            List<float[]> embeddings = jinaEmbeddingClient.embed(List.of(request.getJobDescription()));
            if (!embeddings.isEmpty()) {
                List<String> relevantDocs = pgVectorRepository.findSimilar(userId, embeddings.get(0), 4);
                if (relevantDocs != null && !relevantDocs.isEmpty()) {
                    relevantContext = String.join("\n- ", relevantDocs);
                }
            }
        } catch (Exception e) {
            log.warn("[AiApplicationService] RAG retrieval failed for cover letter, continuing with profile data: {}", e.getMessage());
        }

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

        // RAG: Retrieve top 5 most relevant experiences/projects for this job description
        String relevantContext = "";
        try {
            List<float[]> embeddings = jinaEmbeddingClient.embed(List.of(request.getJobDescription()));
            if (!embeddings.isEmpty()) {
                List<String> relevantDocs = pgVectorRepository.findSimilar(userId, embeddings.get(0), 5);
                if (relevantDocs != null && !relevantDocs.isEmpty()) {
                    relevantContext = String.join("\n- ", relevantDocs);
                }
            }
        } catch (Exception e) {
            log.warn("[AiApplicationService] RAG retrieval failed for tailor resume, continuing with profile data: {}", e.getMessage());
        }

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

    public AiMatchResponse matchJob(Long userId, String jobDescription) {
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
            return new AiMatchResponse(
                root.get("score").asInt(),
                root.get("feedback").asText()
            );
        }
        throw new RuntimeException("AI generated invalid structure: missing 'score' or 'feedback'");
    }
}
