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
@RequiredArgsConstructor
@Slf4j
public class AiApplicationService {

    private final SubscriptionService subscriptionService;
    private final ProfileService profileService;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

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

        String systemPrompt = "You are an expert technical recruiter and career coach. Write a highly professional and tailored cover letter. Output JSON in format: {\"coverLetter\": \"<text>\"}";
        String userMessage = String.format(
            "Candidate Profile:\n%s\n\nJob Description:\n%s\n\nTarget Role: %s",
            profileJson, request.getJobDescription(), request.getTargetRole() != null ? request.getTargetRole() : "Software Engineer"
        );

        String rawJson = groqClient.structuredCompletion(systemPrompt, userMessage);
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            return new AiApplicationResponse(root.get("coverLetter").asText());
        } catch (Exception e) {
            log.error("Failed to parse Cover Letter JSON", e);
            throw new RuntimeException("AI generated invalid structure", e);
        }
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

        String systemPrompt = "You are an expert technical resume writer. Rewrite the candidate's resume summary and experience to align with the JD. Output JSON in format: {\"suggestions\": \"<markdown text>\"}";
        String userMessage = String.format(
            "Candidate Profile:\n%s\n\nJob Description:\n%s",
            profileJson, request.getJobDescription()
        );

        String rawJson = groqClient.structuredCompletion(systemPrompt, userMessage);
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            return new AiApplicationResponse(root.get("suggestions").asText());
        } catch (Exception e) {
            log.error("Failed to parse Tailor JSON", e);
            throw new RuntimeException("AI generated invalid structure", e);
        }
    }
}

