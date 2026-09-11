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

    private static final java.util.Set<String> ALLOWED_SECTIONS = java.util.Set.of(
            "summary", "experience", "education", "skills", "languages", "projects"
    );

    @Transactional
    public void updateSectionOrder(Long userId, List<String> sectionOrder) {
        if (sectionOrder == null || sectionOrder.isEmpty()) {
            throw new IllegalArgumentException("Section order cannot be empty");
        }
        if (sectionOrder.size() > ALLOWED_SECTIONS.size()) {
            throw new IllegalArgumentException("Section order contains too many items");
        }
        java.util.Set<String> seen = new java.util.HashSet<>();
        for (String section : sectionOrder) {
            if (section == null || !ALLOWED_SECTIONS.contains(section.toLowerCase().trim())) {
                throw new IllegalArgumentException("Invalid section name: " + section);
            }
            if (!seen.add(section.toLowerCase().trim())) {
                throw new IllegalArgumentException("Duplicate section in order: " + section);
            }
        }
        Profile profile = getProfileEntityForUpdate(userId);
        profile.setSectionOrder(sectionOrder.stream().map(s -> s.toLowerCase().trim()).toList());
        profileRepository.save(profile);
        publishAfterCommit(userId);
    }

    @Transactional
    @CacheEvict(value = "profiles", key = "#userId")
    public ProfileDto importParsedResume(Long userId, AiParsedResumeDto parsed) {
        Profile profile = getProfileEntityForUpdate(userId);
        
        if (parsed.getFullName() != null) profile.setFullName(truncate(parsed.getFullName(), 255));
        if (parsed.getHeadline() != null) profile.setHeadline(truncate(parsed.getHeadline(), 500));
        if (parsed.getSummary() != null) profile.setSummary(parsed.getSummary());
        if (parsed.getLocation() != null) profile.setLocation(truncate(parsed.getLocation(), 255));
        if (parsed.getWebsite() != null) profile.setWebsite(truncate(parsed.getWebsite(), 500));
        if (parsed.getGithubUsername() != null) profile.setGithubUsername(truncate(parsed.getGithubUsername(), 100));
        if (parsed.getTelegram() != null) profile.setTelegram(truncate(parsed.getTelegram(), 100));
        if (parsed.getLinkedin() != null) profile.setLinkedin(truncate(parsed.getLinkedin(), 255));
        
        // Smart Merge guarantees the DTO has the FINAL state, so we overwrite collections
        // ONLY if the parsed object explicitly provided items for that section
        if (parsed.getSkills() != null && !parsed.getSkills().isEmpty()) profile.getSkills().clear();
        if (parsed.getExperience() != null && !parsed.getExperience().isEmpty()) profile.getExperiences().clear();
        if (parsed.getEducation() != null && !parsed.getEducation().isEmpty()) profile.getEducations().clear();
        if (parsed.getLanguages() != null && !parsed.getLanguages().isEmpty()) profile.getLanguages().clear();
        if (parsed.getProjects() != null && !parsed.getProjects().isEmpty()) profile.getProjects().clear();
        
        profileRepository.saveAndFlush(profile);

        // Batch save skills
        if (parsed.getSkills() != null && !parsed.getSkills().isEmpty()) {
            int order = 0;
            List<Skill> newSkills = new java.util.ArrayList<>();
            for (com.medev.modules.ai.dto.AiSkillDto s : parsed.getSkills()) {
                String skillName = truncate(s.getName(), 100);
                if (skillName != null && !skillName.isBlank()) {
                    newSkills.add(Skill.builder().profile(profile).name(skillName).sortOrder(order++).build());
                }
            }
            if (!newSkills.isEmpty()) {
                skillRepository.saveAll(newSkills);
                profile.getSkills().addAll(newSkills);
            }
        }

        // Batch save experience
        if (parsed.getExperience() != null && !parsed.getExperience().isEmpty()) {
            int order = 0;
            List<Experience> newExperiences = new java.util.ArrayList<>();
            for (com.medev.modules.ai.dto.AiExperienceDto e : parsed.getExperience()) {
                String company = truncate(e.getCompany(), 255);
                if (company == null || company.isBlank()) {
                    company = "Company";
                }
                String position = truncate(e.getPosition(), 255);
                if (position == null || position.isBlank()) {
                    position = "Software Engineer";
                }
                LocalDate start = parseDateSafe(e.getStartDate());
                LocalDate end = parseDateSafe(e.getEndDate());

                newExperiences.add(Experience.builder()
                        .profile(profile)
                        .company(company)
                        .position(position)
                        .description(e.getDescription())
                        .techStack(truncate(e.getTechStack(), 500))
                        .startDate(start)
                        .endDate(end)
                        .isCurrent(e.getIsCurrent() != null ? e.getIsCurrent() : false)
                        .sortOrder(order++)
                        .build());
            }
            if (!newExperiences.isEmpty()) {
                experienceRepository.saveAll(newExperiences);
                profile.getExperiences().addAll(newExperiences);
            }
        }

        // Batch save education
        if (parsed.getEducation() != null && !parsed.getEducation().isEmpty()) {
            int order = 0;
            List<Education> newEducations = new java.util.ArrayList<>();
            for (com.medev.modules.ai.dto.AiEducationDto ed : parsed.getEducation()) {
                String institution = truncate(ed.getInstitution(), 255);
                if (institution == null || institution.isBlank()) {
                    institution = "University";
                }
                LocalDate start = parseDateSafe(ed.getStartDate());
                LocalDate end = parseDateSafe(ed.getEndDate());

                newEducations.add(Education.builder()
                        .profile(profile)
                        .institution(institution)
                        .degree(truncate(ed.getDegree(), 255))
                        .field(truncate(ed.getFieldOfStudy(), 255))
                        .startDate(start)
                        .endDate(end)
                        .isCurrent(false)
                        .sortOrder(order++)
                        .build());
            }
            if (!newEducations.isEmpty()) {
                educationRepository.saveAll(newEducations);
                profile.getEducations().addAll(newEducations);
            }
        }

        // Batch save languages & rerouted programming language skills
        if (parsed.getLanguages() != null && !parsed.getLanguages().isEmpty()) {
            int order = 0;
            List<Language> newLanguages = new java.util.ArrayList<>();
            List<Skill> reroutedSkills = new java.util.ArrayList<>();

            for (com.medev.modules.ai.dto.AiLanguageDto l : parsed.getLanguages()) {
                String cleanName = truncate(l.getName(), 100);
                if (cleanName != null && !cleanName.isBlank()) {
                    if (LanguageService.isProgrammingLanguage(cleanName)) {
                        boolean skillExists = profile.getSkills().stream()
                                .anyMatch(s -> s.getName().equalsIgnoreCase(cleanName));
                        if (!skillExists) {
                            Skill fallbackSkill = Skill.builder()
                                    .profile(profile)
                                    .name(cleanName)
                                    .category("Languages")
                                    .sortOrder(profile.getSkills().size() + reroutedSkills.size())
                                    .build();
                            reroutedSkills.add(fallbackSkill);
                        }
                        continue;
                    }

                    String level = truncate(l.getProficiency(), 20);
                    if (level == null || level.isBlank()) {
                        level = "intermediate";
                    }
                    newLanguages.add(Language.builder()
                            .profile(profile)
                            .name(cleanName)
                            .level(level)
                            .sortOrder(order++)
                            .build());
                }
            }
            if (!reroutedSkills.isEmpty()) {
                skillRepository.saveAll(reroutedSkills);
                profile.getSkills().addAll(reroutedSkills);
            }
            if (!newLanguages.isEmpty()) {
                languageRepository.saveAll(newLanguages);
                profile.getLanguages().addAll(newLanguages);
            }
        }

        // Batch save projects
        if (parsed.getProjects() != null && !parsed.getProjects().isEmpty()) {
            int order = 0;
            List<Project> newProjects = new java.util.ArrayList<>();
            for (com.medev.modules.ai.dto.AiProjectDto p : parsed.getProjects()) {
                String name = truncate(p.getName(), 255);
                if (name != null && !name.isBlank()) {
                    newProjects.add(Project.builder()
                            .profile(profile)
                            .name(name)
                            .description(p.getDescription())
                            .githubUrl(truncate(p.getGithubUrl(), 500))
                            .techStack(truncate(p.getTechStack(), 500))
                            .sortOrder(order++)
                            .build());
                }
            }
            if (!newProjects.isEmpty()) {
                projectRepository.saveAll(newProjects);
                profile.getProjects().addAll(newProjects);
            }
        }


        publishAfterCommit(userId);
        return mapToProfileDto(profile);
    }

    private String truncate(String val, int max) {
        if (val == null) return null;
        String trimmed = val.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
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
                        .position("Open Source Contributor")
                        .isCurrent(true)
                        .description("[Draft / GitHub Import] Contributor at " + org)
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
            if (trimmed.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
                return LocalDate.parse(trimmed);
            } else if (trimmed.matches("^\\d{4}-\\d{2}$")) {
                return LocalDate.parse(trimmed + "-01");
            } else if (trimmed.matches("^\\d{4}$")) {
                return LocalDate.parse(trimmed + "-01-01");
            } else if (trimmed.matches("^\\d{2}\\.\\d{4}$")) {
                String[] parts = trimmed.split("\\.");
                return LocalDate.parse(parts[1] + "-" + parts[0] + "-01");
            } else if (trimmed.matches("^\\d{2}/\\d{4}$")) {
                String[] parts = trimmed.split("/");
                return LocalDate.parse(parts[1] + "-" + parts[0] + "-01");
            } else {
                return LocalDate.parse(trimmed);
            }
        } catch (Exception e) {
            log.warn("Failed to parse date string '{}': {}", dateStr, e.getMessage());
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
