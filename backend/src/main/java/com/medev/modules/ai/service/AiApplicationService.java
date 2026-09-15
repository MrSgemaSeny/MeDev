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

        String systemPrompt = "You are an expert technical recruiter and career coach. Write a highly personalized, compelling, and ready-to-send cover letter from the candidate's perspective.\n"
                + "CRITICAL RULES:\n"
                + "1. Strictly output PLAIN TEXT ONLY. Do NOT use any markdown formatting (no **, no ##, no markdown bullets, no asterisks).\n"
                + "2. NEVER use generic placeholder brackets like [Your Name], [Candidate Name], [Date], [Company Name], [Phone], [Hiring Manager], or [Address]. Use the actual candidate details provided or omit the bracketed placeholders entirely.\n"
                + "3. Write directly in the candidate's voice, matching their actual experience, skills, and background with the job description.\n"
                + "4. Structure the text cleanly with standard paragraph line breaks (\\n\\n).\n"
                + "5. Output JSON in format: {\"coverLetter\": \"<plain text without markdown or placeholders>\"}";

        String candidateSummary = buildCandidateProfileContext(profile);

        String userMessage = String.format(
            "Candidate Information:\n%s\n\nCandidate's Most Relevant Experience & Projects (Retrieved via AI Search):\n- %s\n\nJob Description:\n%s\n\nTarget Role: %s\n\nWrite a fully personalized, professional cover letter for this candidate. Ensure no placeholders like [Name] or [Company] remain in the text.",
            candidateSummary,
            relevantContext.isEmpty() ? "Refer to candidate profile summary." : relevantContext, 
            request.getJobDescription(), 
            request.getTargetRole() != null ? request.getTargetRole() : (profile != null && profile.getHeadline() != null ? profile.getHeadline() : "Software Engineer")
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

        String systemPrompt = "You are an expert technical resume writer and career coach. Analyze the job description against the candidate's background and produce actionable tailoring recommendations with rewritten resume summary and experience highlights.\n"
                + "CRITICAL RULES:\n"
                + "1. Strictly output PLAIN TEXT ONLY. Do NOT use markdown syntax (no ##, no **, no markdown tables, no asterisks).\n"
                + "2. Format sections with UPPERCASE HEADERS (e.g., SUMMARY RECOMMENDATIONS:, EXPERIENCE REWRITES:, KEY KEYWORDS TO ADD:) and standard indented lines for readability.\n"
                + "3. Output text must be clean, copy-paste ready for plain text resume inputs.\n"
                + "4. Output JSON in format: {\"suggestions\": \"<plain text without markdown>\"}";

        String candidateSummary = buildCandidateProfileContext(profile);

        String userMessage = String.format(
            "Candidate Information:\n%s\n\nCandidate's Relevant Experience & Projects (Retrieved via AI Search):\n- %s\n\nTarget Role: %s\n\nJob Description:\n%s",
            candidateSummary,
            relevantContext.isEmpty() ? "No specific vector data found. Use profile info." : relevantContext, 
            request.getTargetRole() != null ? request.getTargetRole() : (profile != null && profile.getHeadline() != null ? profile.getHeadline() : "Software Engineer"),
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
        
        String candidateSummary = buildCandidateProfileContext(profile);

        String systemPrompt = "You are an expert technical recruiter. Evaluate how well the candidate's profile matches the job description. Provide a match score from 0 to 100 and brief constructive feedback on missing skills.\n"
                + "CRITICAL RULES:\n"
                + "1. Strictly output plain text feedback without markdown symbols (no **, no ##, no *).\n"
                + "2. Output JSON in format: {\"score\": 85, \"feedback\": \"<plain text feedback>\"}";
        String userMessage = String.format(
            "Candidate Profile:\n%s\n\nJob Description:\n%s",
            candidateSummary, 
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

    private String buildCandidateProfileContext(ProfileDto profile) {
        if (profile == null) {
            return "No profile details available.";
        }
        StringBuilder sb = new StringBuilder();
        if (profile.getFullName() != null && !profile.getFullName().isBlank()) {
            sb.append("Full Name: ").append(profile.getFullName()).append("\n");
        }
        if (profile.getHeadline() != null && !profile.getHeadline().isBlank()) {
            sb.append("Current Headline / Title: ").append(profile.getHeadline()).append("\n");
        }
        if (profile.getSummary() != null && !profile.getSummary().isBlank()) {
            sb.append("About / Summary: ").append(profile.getSummary()).append("\n");
        }
        if (profile.getLocation() != null && !profile.getLocation().isBlank()) {
            sb.append("Location: ").append(profile.getLocation()).append("\n");
        }
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            sb.append("Skills: ");
            List<String> skillNames = profile.getSkills().stream()
                    .map(s -> s != null && s.getName() != null ? s.getName() : "")
                    .filter(s -> !s.isBlank())
                    .toList();
            sb.append(String.join(", ", skillNames)).append("\n");
        }
        if (profile.getGithubUsername() != null && !profile.getGithubUsername().isBlank()) {
            sb.append("GitHub: ").append(profile.getGithubUsername()).append("\n");
        }
        if (profile.getLinkedin() != null && !profile.getLinkedin().isBlank()) {
            sb.append("LinkedIn: ").append(profile.getLinkedin()).append("\n");
        }
        return sb.toString().trim();
    }
}
