package com.medev.modules.profile.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.entity.*;
import com.medev.modules.profile.repository.*;
import com.medev.modules.ai.dto.*;
import com.medev.shared.exception.ForbiddenException;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final LanguageRepository languageRepository;
    private final ProfileMapper profileMapper;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Transactional
    public void createEmptyProfile(User user) {
        Profile profile = Profile.builder()
                .user(user)
                .isPublic(true)
                .build();
        profileRepository.save(profile);
    }

    @Transactional
    public void setGithubUsernameIfMissing(Long userId, String githubUsername) {
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            if (profile.getGithubUsername() == null || profile.getGithubUsername().isBlank()) {
                profile.setGithubUsername(githubUsername);
                profileRepository.save(profile);
            }
        });
    }

    @Transactional
    public void setAvatarIfMissing(Long userId, String avatarUrl) {
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            if (profile.getAvatarUrl() == null || profile.getAvatarUrl().isBlank()) {
                profile.setAvatarUrl(avatarUrl);
                profileRepository.save(profile);
            }
        });
    }

    public Profile getProfileEntityByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
    }

    @Transactional(readOnly = true)
    public ProfileDto getByUserId(Long userId) {
        Profile profile = getProfileEntityByUserId(userId);
        return mapToProfileDto(profile);
    }

    @Transactional
    public ProfileDto update(Long userId, UpdateProfileRequest request) {
        Profile profile = getProfileEntityByUserId(userId);
        profile.setFullName(request.getFullName());
        profile.setHeadline(request.getHeadline());
        profile.setSummary(request.getSummary());
        profile.setAvatarUrl(request.getAvatarUrl());
        profile.setLocation(request.getLocation());
        profile.setWebsite(request.getWebsite());
        profile.setGithubUsername(request.getGithubUsername());
        profile.setTelegram(request.getTelegram());
        profile.setLinkedin(request.getLinkedin());
        
        profileRepository.save(profile);
        eventPublisher.publishEvent(new com.medev.modules.profile.event.ProfileUpdatedEvent(this, userId));
        return mapToProfileDto(profile);
    }

    @Transactional
    public void updateSectionOrder(Long userId, List<String> sectionOrder) {
        Profile profile = getProfileEntityByUserId(userId);
        profile.setSectionOrder(sectionOrder);
        profileRepository.save(profile);
        eventPublisher.publishEvent(new com.medev.modules.profile.event.ProfileUpdatedEvent(this, userId));
    }

    @Transactional
    public ProfileDto importParsedResume(Long userId, AiParsedResumeDto parsed) {
        Profile profile = getProfileEntityByUserId(userId);
        
        if (parsed.getFullName() != null) profile.setFullName(parsed.getFullName());
        if (parsed.getHeadline() != null) profile.setHeadline(parsed.getHeadline());
        if (parsed.getSummary() != null) profile.setSummary(parsed.getSummary());
        if (parsed.getLocation() != null) profile.setLocation(parsed.getLocation());
        if (parsed.getWebsite() != null) profile.setWebsite(parsed.getWebsite());
        if (parsed.getGithubUsername() != null) profile.setGithubUsername(parsed.getGithubUsername());
        if (parsed.getTelegram() != null) profile.setTelegram(parsed.getTelegram());
        if (parsed.getLinkedin() != null) profile.setLinkedin(parsed.getLinkedin());
        
        // Smart Merge guarantees the DTO has the FINAL state, so we overwrite collections
        profile.getSkills().clear();
        profile.getExperiences().clear();
        profile.getEducations().clear();
        profile.getLanguages().clear();
        profile.getProjects().clear();
        
        profileRepository.saveAndFlush(profile);

        if (parsed.getSkills() != null) {
            int order = 0;
            for (com.medev.modules.ai.dto.AiSkillDto s : parsed.getSkills()) {
                if (s.getName() != null && !s.getName().isBlank()) {
                    Skill skill = Skill.builder().profile(profile).name(s.getName()).sortOrder(order++).build();
                    skillRepository.save(skill);
                }
            }
        }

        if (parsed.getExperience() != null) {
            int order = 0;
            for (com.medev.modules.ai.dto.AiExperienceDto e : parsed.getExperience()) {
                Experience exp = Experience.builder()
                        .profile(profile)
                        .company(e.getCompany())
                        .position(e.getPosition())
                        .description(e.getDescription())
                        .techStack(e.getTechStack())
                        .isCurrent(e.getIsCurrent() != null ? e.getIsCurrent() : false)
                        .sortOrder(order++)
                        .build();
                if (e.getStartDate() != null) { try { exp.setStartDate(java.time.LocalDate.parse(e.getStartDate() + "-01")); } catch (Exception ignored) {} }
                if (e.getEndDate() != null) { try { exp.setEndDate(java.time.LocalDate.parse(e.getEndDate() + "-01")); } catch (Exception ignored) {} }
                experienceRepository.save(exp);
            }
        }

        if (parsed.getEducation() != null) {
            int order = 0;
            for (com.medev.modules.ai.dto.AiEducationDto ed : parsed.getEducation()) {
                Education edu = Education.builder()
                        .profile(profile)
                        .institution(ed.getInstitution())
                        .degree(ed.getDegree())
                        .field(ed.getFieldOfStudy())
                        .sortOrder(order++)
                        .build();
                if (ed.getStartDate() != null) { try { edu.setStartDate(java.time.LocalDate.parse(ed.getStartDate() + "-01")); } catch (Exception ignored) {} }
                if (ed.getEndDate() != null) { try { edu.setEndDate(java.time.LocalDate.parse(ed.getEndDate() + "-01")); } catch (Exception ignored) {} }
                educationRepository.save(edu);
            }
        }

        if (parsed.getLanguages() != null) {
            int order = 0;
            for (com.medev.modules.ai.dto.AiLanguageDto l : parsed.getLanguages()) {
                if (l.getName() != null && !l.getName().isBlank()) {
                    Language lang = Language.builder().profile(profile).name(l.getName()).level(l.getProficiency()).sortOrder(order++).build();
                    languageRepository.save(lang);
                }
            }
        }

        if (parsed.getProjects() != null) {
            int order = 0;
            for (com.medev.modules.ai.dto.AiProjectDto p : parsed.getProjects()) {
                if (p.getName() != null && !p.getName().isBlank()) {
                    Project proj = Project.builder()
                            .profile(profile)
                            .name(p.getName())
                            .description(p.getDescription())
                            .githubUrl(p.getGithubUrl())
                            .techStack(p.getTechStack())
                            .sortOrder(order++)
                            .build();
                    projectRepository.save(proj);
                }
            }
        }

        eventPublisher.publishEvent(new com.medev.modules.profile.event.ProfileUpdatedEvent(this, userId));
        return mapToProfileDto(profile);
    }





    // ==========================================
    // MAPPERS
    // ==========================================
    private ProfileDto mapToProfileDto(Profile profile) {
        return profileMapper.toDto(profile);
    }
    


    // ==========================================
    // GITHUB IMPORTS
    // ==========================================
    @Transactional
    public void updateFromGitHub(Long userId, com.medev.modules.github.dto.GitHubProfileDto github) {
        Profile profile = getProfileEntityByUserId(userId);
        
        if (github.getName() != null && profile.getFullName() == null) profile.setFullName(github.getName());
        if (github.getAvatarUrl() != null) profile.setAvatarUrl(github.getAvatarUrl());
        if (github.getLocation() != null && profile.getLocation() == null) profile.setLocation(github.getLocation());
        if (github.getBio() != null && profile.getSummary() == null) profile.setSummary(github.getBio());
        
        profile.setGithubUsername(github.getUsername());
        profileRepository.save(profile);
        eventPublisher.publishEvent(new com.medev.modules.profile.event.ProfileUpdatedEvent(this, userId));
    }

    @Transactional
    public void importProjects(Long userId, List<com.medev.modules.github.dto.GitHubRepoDto> repos) {
        Profile profile = getProfileEntityByUserId(userId);
        List<Project> existingProjects = projectRepository.findByProfileIdOrderBySortOrderAsc(profile.getId());

        // Deduplicate existing projects (in case of previous race conditions)
        java.util.Set<String> seenNames = new java.util.HashSet<>();
        java.util.List<Project> toDelete = new java.util.ArrayList<>();
        for (Project p : existingProjects) {
            String key = p.getName() != null ? p.getName().toLowerCase() : "";
            if (!key.isEmpty() && !seenNames.add(key)) {
                toDelete.add(p);
            }
        }
        if (!toDelete.isEmpty()) {
            projectRepository.deleteAll(toDelete);
            existingProjects.removeAll(toDelete);
            profile.getProjects().removeAll(toDelete);
        }

        for (com.medev.modules.github.dto.GitHubRepoDto repo : repos) {
            boolean exists = existingProjects.stream().anyMatch(p -> 
                (p.getGithubUrl() != null && p.getGithubUrl().equalsIgnoreCase(repo.getHtmlUrl())) || 
                (p.getName() != null && p.getName().equalsIgnoreCase(repo.getName()))
            );

            if (!exists) {
                Project project = Project.builder()
                        .profile(profile)
                        .name(repo.getName())
                        .description(repo.getDescription())
                        .githubUrl(repo.getHtmlUrl())
                        .techStack(repo.getLanguage())
                        .build();
                projectRepository.save(project);
                existingProjects.add(project); // Update local list for subsequent iterations
            }
        }
        eventPublisher.publishEvent(new com.medev.modules.profile.event.ProfileUpdatedEvent(this, userId));
    }

    @Transactional
    public void addSkillIfNotExists(Long userId, String skillName, String category) {
        Profile profile = getProfileEntityByUserId(userId);
        List<Skill> existingSkills = skillRepository.findByProfileIdOrderBySortOrderAsc(profile.getId());
        if (existingSkills.stream().noneMatch(s -> s.getName().equalsIgnoreCase(skillName))) {
            Skill skill = Skill.builder()
                    .profile(profile)
                    .name(skillName)
                    .category(category)
                    .build();
            skillRepository.save(skill);
        }
    }
}
