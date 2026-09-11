package com.medev.modules.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.dto.AiOnboardingRequest;
import com.medev.modules.ai.dto.AiOnboardingResponse;
import com.medev.modules.ai.model.LlmException;
import com.medev.modules.profile.entity.Experience;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.entity.Skill;
import com.medev.modules.profile.repository.ExperienceRepository;
import com.medev.modules.profile.repository.ProfileRepository;
import com.medev.modules.profile.repository.SkillRepository;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class AiOnboardingService extends AbstractAiStructuredService {

    private final PromptLoader promptLoader;
    private final ProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final ExperienceRepository experienceRepository;

    public AiOnboardingService(
            LlmProvider llmProvider,
            ObjectMapper objectMapper,
            PromptLoader promptLoader,
            ProfileRepository profileRepository,
            SkillRepository skillRepository,
            ExperienceRepository experienceRepository) {
        super(llmProvider, objectMapper);
        this.promptLoader = promptLoader;
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.experienceRepository = experienceRepository;
    }

    @Transactional
    public AiOnboardingResponse generateAndSaveProfile(Long userId, AiOnboardingRequest request) {
        String systemPrompt = promptLoader.load("onboarding_wizard_v1");
        
        String userMessage = String.format("""
                Role: %s
                Stack: %s
                Recent Experience: %s
                """, request.getRole(), request.getStack(), request.getRecentExperience());

        AiOnboardingResponse response = generateStructuredData(systemPrompt, userMessage, AiOnboardingResponse.class);

        // Save to Database
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        if (profile.getSummary() == null || profile.getSummary().isEmpty()) {
            profile.setSummary(response.getBio());
        }
        if (profile.getHeadline() == null || profile.getHeadline().isEmpty()) {
            profile.setHeadline(response.getHeadline());
        }
        profile.setIsOnboardingCompleted(true);
        profileRepository.save(profile);

        if (response.getSkills() != null) {
            java.util.List<Skill> existingSkills = skillRepository.findByProfileIdOrderBySortOrderAsc(profile.getId());
            java.util.Set<String> existingNames = existingSkills.stream()
                    .map(s -> s.getName().toLowerCase())
                    .collect(java.util.stream.Collectors.toSet());

            java.util.List<Skill> toSave = new java.util.ArrayList<>();
            for (AiOnboardingResponse.SkillDto s : response.getSkills()) {
                if (s.getName() != null && !existingNames.contains(s.getName().toLowerCase())) {
                    toSave.add(Skill.builder()
                            .profile(profile)
                            .name(s.getName())
                            .category(s.getCategory())
                            .build());
                }
            }
            if (!toSave.isEmpty()) {
                skillRepository.saveAll(toSave);
            }
        }

        if (response.getExperiences() != null && !response.getExperiences().isEmpty()) {
            java.util.List<Experience> toSave = new java.util.ArrayList<>();
            for (AiOnboardingResponse.ExperienceDto exp : response.getExperiences()) {
                toSave.add(Experience.builder()
                        .profile(profile)
                        .company(exp.getCompany())
                        .position(exp.getPosition())
                        .description(exp.getParsedDescription())
                        .startDate(null)
                        .endDate(null)
                        .build());
            }
            experienceRepository.saveAll(toSave);
        }

        return response;
    }
}
