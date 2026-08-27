package com.medev.modules.profile.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.entity.*;
import com.medev.modules.profile.repository.*;
import com.medev.modules.ai.dto.*;
import com.medev.shared.exception.ForbiddenException;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import com.medev.modules.profile.event.ProfileUpdatedEvent;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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
        profileRepository.findByUserIdForUpdate(userId).ifPresent(profile -> {
            if (profile.getGithubUsername() == null || profile.getGithubUsername().isBlank()) {
                profile.setGithubUsername(githubUsername);
                profileRepository.save(profile);
                publishAfterCommit(userId);
            }
        });
    }

    @Transactional
    public void setAvatarIfMissing(Long userId, String avatarUrl) {
        profileRepository.findByUserIdForUpdate(userId).ifPresent(profile -> {
            if (profile.getAvatarUrl() == null || profile.getAvatarUrl().isBlank()) {
                profile.setAvatarUrl(avatarUrl);
                profileRepository.save(profile);
                publishAfterCommit(userId);
            }
        });
    }

    public Profile getProfileEntityByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
    }

    public Profile getProfileEntityForUpdate(Long userId) {
        return profileRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "profiles", key = "#userId")
    public ProfileDto getByUserId(Long userId) {
        Profile profile = getProfileEntityByUserId(userId);
        return mapToProfileDto(profile);
    }

    @Transactional
    @CacheEvict(value = "profiles", key = "#userId")
    public ProfileDto update(Long userId, UpdateProfileRequest request) {
        Profile profile = getProfileEntityForUpdate(userId);
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
        publishAfterCommit(userId);
        return mapToProfileDto(profile);
    }

    @Transactional
    public void updateSectionOrder(Long userId, List<String> sectionOrder) {
        Profile profile = getProfileEntityForUpdate(userId);
        profile.setSectionOrder(sectionOrder);
        profileRepository.save(profile);
        publishAfterCommit(userId);
    }

    @Transactional
    public ProfileDto importParsedResume(Long userId, AiParsedResumeDto parsed) {
        Profile profile = getProfileEntityForUpdate(userId);
        
        if (parsed.getFullName() != null) profile.setFullName(parsed.getFullName());
        if (parsed.getHeadline() != null) profile.setHeadline(parsed.getHeadline());
        if (parsed.getSummary() != null) profile.setSummary(parsed.getSummary());
        if (parsed.getLocation() != null) profile.setLocation(parsed.getLocation());
        if (parsed.getWebsite() != null) profile.setWebsite(parsed.getWebsite());
        if (parsed.getGithubUsername() != null) profile.setGithubUsername(parsed.getGithubUsername());
        if (parsed.getTelegram() != null) profile.setTelegram(parsed.getTelegram());
        if (parsed.getLinkedin() != null) profile.setLinkedin(parsed.getLinkedin());
        
        // Smart Merge guarantees the DTO has the FINAL state, so we overwrite collections
        // ONLY if the parsed object explicitly provided items for that section
        if (parsed.getSkills() != null && !parsed.getSkills().isEmpty()) profile.getSkills().clear();
        if (parsed.getExperience() != null && !parsed.getExperience().isEmpty()) profile.getExperiences().clear();
        if (parsed.getEducation() != null && !parsed.getEducation().isEmpty()) profile.getEducations().clear();
        if (parsed.getLanguages() != null && !parsed.getLanguages().isEmpty()) profile.getLanguages().clear();
        if (parsed.getProjects() != null && !parsed.getProjects().isEmpty()) profile.getProjects().clear();
        
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
                LocalDate start = e.getStartDate();
                if (start == null) {
                    start = LocalDate.now();
                }
                Experience exp = Experience.builder()
                        .profile(profile)
                        .company(e.getCompany())
                        .position(e.getPosition())
                        .description(e.getDescription())
                        .techStack(e.getTechStack())
                        .startDate(start)
                        .endDate(e.getEndDate())
                        .isCurrent(e.getIsCurrent() != null ? e.getIsCurrent() : false)
                        .sortOrder(order++)
                        .build();
                experienceRepository.save(exp);
            }
        }

        if (parsed.getEducation() != null) {
            int order = 0;
            for (com.medev.modules.ai.dto.AiEducationDto ed : parsed.getEducation()) {
                LocalDate start = ed.getStartDate();
                if (start == null) {
                    start = LocalDate.now();
                }
                Education edu = Education.builder()
                        .profile(profile)
                        .institution(ed.getInstitution())
                        .degree(ed.getDegree())
                        .field(ed.getFieldOfStudy())
                        .startDate(start)
                        .endDate(ed.getEndDate())
                        .sortOrder(order++)
                        .build();
                educationRepository.save(edu);
            }
        }

        if (parsed.getLanguages() != null) {
            int order = 0;
            for (com.medev.modules.ai.dto.AiLanguageDto l : parsed.getLanguages()) {
                if (l.getName() != null && !l.getName().isBlank()) {
                    String level = l.getProficiency();
                    if (level == null || level.isBlank()) {
                        level = "Not specified";
                    }
                    Language lang = Language.builder().profile(profile).name(l.getName()).level(level).sortOrder(order++).build();
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

        publishAfterCommit(userId);
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
        Profile profile = getProfileEntityForUpdate(userId);
        
        if (github.getName() != null && profile.getFullName() == null) profile.setFullName(github.getName());
        if (github.getAvatarUrl() != null) profile.setAvatarUrl(github.getAvatarUrl());
        if (github.getLocation() != null && profile.getLocation() == null) profile.setLocation(github.getLocation());
        if (github.getBio() != null && profile.getSummary() == null) profile.setSummary(github.getBio());
        
        profile.setGithubUsername(github.getUsername());
        profileRepository.save(profile);
        publishAfterCommit(userId);
    }

    @Transactional
    public void importProjects(Long userId, List<com.medev.modules.github.dto.GitHubRepoDto> repos) {
        Profile profile = getProfileEntityForUpdate(userId);
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
        publishAfterCommit(userId);
    }

    @Transactional
    public void addSkillIfNotExists(Long userId, String skillName, String category) {
        Profile profile = getProfileEntityForUpdate(userId);
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
    
    @Transactional
    public void importOrganizationsAsExperience(Long userId, List<String> orgs) {
        Profile profile = getProfileEntityForUpdate(userId);
        List<Experience> existingExp = experienceRepository.findByProfileIdOrderBySortOrderAsc(profile.getId());
        
        for (String org : orgs) {
            boolean exists = existingExp.stream().anyMatch(e -> 
                e.getCompany() != null && e.getCompany().equalsIgnoreCase(org)
            );
            
            if (!exists) {
                Experience exp = Experience.builder()
                        .profile(profile)
                        .company(org)
                        .position("Software Engineer")
                        .isCurrent(true)
                        .description("Contributor at " + org)
                        .startDate(java.time.LocalDate.now().minusMonths(1)) // fallback date
                        .build();
                experienceRepository.save(exp);
                existingExp.add(exp);
            }
        }
        publishAfterCommit(userId);
    }
    
    @Transactional
    public void importLanguageExperience(Long userId, String language, java.time.LocalDate startDate) {
        Profile profile = getProfileEntityForUpdate(userId);
        List<Experience> existingExp = experienceRepository.findByProfileIdOrderBySortOrderAsc(profile.getId());
        
        String title = language + " Developer";
        boolean exists = existingExp.stream().anyMatch(e -> 
            e.getPosition() != null && e.getPosition().equalsIgnoreCase(title)
        );
        
        if (!exists) {
            Experience exp = Experience.builder()
                    .profile(profile)
                    .company("Independent / Open Source")
                    .position(title)
                    .isCurrent(true)
                    .description("Developed projects using " + language)
                    .startDate(startDate)
                    .build();
            experienceRepository.save(exp);
            existingExp.add(exp);
            publishAfterCommit(userId);
        }
    }

    private LocalDate parseDateSafe(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        String trimmed = dateStr.trim();
        try {
            if (trimmed.length() == 10) { // yyyy-MM-dd
                return LocalDate.parse(trimmed);
            } else if (trimmed.length() == 7) { // yyyy-MM
                return LocalDate.parse(trimmed + "-01");
            } else if (trimmed.length() == 4) { // yyyy
                return LocalDate.parse(trimmed + "-01-01");
            } else {
                return LocalDate.parse(trimmed);
            }
        } catch (Exception e) {
            log.warn("Failed to parse date string '{}'", dateStr);
            return null;
        }
    }

    /**
     * Публикует ProfileUpdatedEvent строго ПОСЛЕ коммита транзакции.
     *
     * Проблема без этого: publishEvent() внутри @Transactional вызывается до коммита.
     * @Async listener стартует параллельно -> эвиктит кэш -> следующий cache-miss
     * читает из БД незакоммиченные (старые) данные -> кеширует их. Баг.
     *
     * Фикс: registerSynchronization().afterCommit() гарантирует порядок:
     * [commit] -> [evict cache] -> [следующий запрос видит свежие данные].
     */
    private void publishAfterCommit(Long userId) {
        ProfileUpdatedEvent event = new ProfileUpdatedEvent(this, userId);
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishEvent(event);
                }
            });
        } else {
            // вне транзакции — публикуем сразу (тесты без @Transactional контекста)
            eventPublisher.publishEvent(event);
        }
    }
}
