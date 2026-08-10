package com.medev.modules.profile.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.entity.*;
import com.medev.modules.profile.repository.*;
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
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final SkillRepository skillRepository;
    private final LanguageRepository languageRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public void createEmptyProfile(User user) {
        Profile profile = Profile.builder()
                .user(user)
                .isPublic(true)
                .build();
        profileRepository.save(profile);
    }

    private Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found"));
    }

    @Transactional(readOnly = true)
    public ProfileDto getByUserId(Long userId) {
        Profile profile = getProfileByUserId(userId);
        return mapToProfileDto(profile);
    }

    @Transactional
    public ProfileDto update(Long userId, UpdateProfileRequest request) {
        Profile profile = getProfileByUserId(userId);
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
        return mapToProfileDto(profile);
    }

    @Transactional
    public void updateSectionOrder(Long userId, List<String> sectionOrder) {
        Profile profile = getProfileByUserId(userId);
        profile.setSectionOrder(sectionOrder);
        profileRepository.save(profile);
    }

    // ==========================================
    // EXPERIENCE
    // ==========================================
    @Transactional
    public ExperienceDto addExperience(Long userId, ExperienceRequest request) {
        Profile profile = getProfileByUserId(userId);
        Experience exp = Experience.builder()
                .profile(profile)
                .company(request.getCompany())
                .position(request.getPosition())
                .description(request.getDescription())
                .techStack(request.getTechStack())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent() != null ? request.getIsCurrent() : false)
                .build();
        experienceRepository.save(exp);
        return mapToExperienceDto(exp);
    }

    @Transactional
    public ExperienceDto updateExperience(Long userId, Long id, ExperienceRequest request) {
        Profile profile = getProfileByUserId(userId);
        Experience exp = experienceRepository.findById(id).orElseThrow(() -> new NotFoundException("Experience not found"));
        if (!exp.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        exp.setCompany(request.getCompany());
        exp.setPosition(request.getPosition());
        exp.setDescription(request.getDescription());
        exp.setTechStack(request.getTechStack());
        exp.setStartDate(request.getStartDate());
        exp.setEndDate(request.getEndDate());
        exp.setIsCurrent(request.getIsCurrent() != null ? request.getIsCurrent() : false);
        experienceRepository.save(exp);
        return mapToExperienceDto(exp);
    }

    @Transactional
    public void deleteExperience(Long userId, Long id) {
        Profile profile = getProfileByUserId(userId);
        Experience exp = experienceRepository.findById(id).orElseThrow(() -> new NotFoundException("Experience not found"));
        if (!exp.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        experienceRepository.delete(exp);
    }

    @Transactional
    public void reorderExperience(Long userId, List<Long> orderedIds) {
        Profile profile = getProfileByUserId(userId);
        List<Experience> items = experienceRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            experienceRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }

    // ==========================================
    // EDUCATION
    // ==========================================
    @Transactional
    public EducationDto addEducation(Long userId, EducationRequest request) {
        Profile profile = getProfileByUserId(userId);
        Education edu = Education.builder()
                .profile(profile)
                .institution(request.getInstitution())
                .degree(request.getDegree())
                .field(request.getField())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent() != null ? request.getIsCurrent() : false)
                .build();
        educationRepository.save(edu);
        return mapToEducationDto(edu);
    }

    @Transactional
    public EducationDto updateEducation(Long userId, Long id, EducationRequest request) {
        Profile profile = getProfileByUserId(userId);
        Education edu = educationRepository.findById(id).orElseThrow(() -> new NotFoundException("Education not found"));
        if (!edu.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        edu.setInstitution(request.getInstitution());
        edu.setDegree(request.getDegree());
        edu.setField(request.getField());
        edu.setStartDate(request.getStartDate());
        edu.setEndDate(request.getEndDate());
        edu.setIsCurrent(request.getIsCurrent() != null ? request.getIsCurrent() : false);
        educationRepository.save(edu);
        return mapToEducationDto(edu);
    }

    @Transactional
    public void deleteEducation(Long userId, Long id) {
        Profile profile = getProfileByUserId(userId);
        Education edu = educationRepository.findById(id).orElseThrow(() -> new NotFoundException("Education not found"));
        if (!edu.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        educationRepository.delete(edu);
    }

    @Transactional
    public void reorderEducation(Long userId, List<Long> orderedIds) {
        Profile profile = getProfileByUserId(userId);
        List<Education> items = educationRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            educationRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }

    // ==========================================
    // SKILLS
    // ==========================================
    @Transactional
    public SkillDto addSkill(Long userId, SkillRequest request) {
        Profile profile = getProfileByUserId(userId);
        Skill skill = Skill.builder()
                .profile(profile)
                .name(request.getName())
                .category(request.getCategory())
                .level(request.getLevel())
                .build();
        skillRepository.save(skill);
        return mapToSkillDto(skill);
    }

    @Transactional
    public SkillDto updateSkill(Long userId, Long id, SkillRequest request) {
        Profile profile = getProfileByUserId(userId);
        Skill skill = skillRepository.findById(id).orElseThrow(() -> new NotFoundException("Skill not found"));
        if (!skill.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        skill.setLevel(request.getLevel());
        skillRepository.save(skill);
        return mapToSkillDto(skill);
    }

    @Transactional
    public void deleteSkill(Long userId, Long id) {
        Profile profile = getProfileByUserId(userId);
        Skill skill = skillRepository.findById(id).orElseThrow(() -> new NotFoundException("Skill not found"));
        if (!skill.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        skillRepository.delete(skill);
    }

    @Transactional
    public void reorderSkills(Long userId, List<Long> orderedIds) {
        Profile profile = getProfileByUserId(userId);
        List<Skill> items = skillRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            skillRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }

    // ==========================================
    // LANGUAGES
    // ==========================================
    @Transactional
    public LanguageDto addLanguage(Long userId, LanguageRequest request) {
        Profile profile = getProfileByUserId(userId);
        Language lang = Language.builder()
                .profile(profile)
                .name(request.getName())
                .level(request.getLevel())
                .build();
        languageRepository.save(lang);
        return mapToLanguageDto(lang);
    }

    @Transactional
    public LanguageDto updateLanguage(Long userId, Long id, LanguageRequest request) {
        Profile profile = getProfileByUserId(userId);
        Language lang = languageRepository.findById(id).orElseThrow(() -> new NotFoundException("Language not found"));
        if (!lang.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        lang.setName(request.getName());
        lang.setLevel(request.getLevel());
        languageRepository.save(lang);
        return mapToLanguageDto(lang);
    }

    @Transactional
    public void deleteLanguage(Long userId, Long id) {
        Profile profile = getProfileByUserId(userId);
        Language lang = languageRepository.findById(id).orElseThrow(() -> new NotFoundException("Language not found"));
        if (!lang.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        languageRepository.delete(lang);
    }

    @Transactional
    public void reorderLanguages(Long userId, List<Long> orderedIds) {
        Profile profile = getProfileByUserId(userId);
        List<Language> items = languageRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            languageRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }

    // ==========================================
    // PROJECTS
    // ==========================================
    @Transactional
    public ProjectDto addProject(Long userId, ProjectRequest request) {
        Profile profile = getProfileByUserId(userId);
        Project project = Project.builder()
                .profile(profile)
                .name(request.getName())
                .description(request.getDescription())
                .techStack(request.getTechStack())
                .githubUrl(request.getGithubUrl())
                .liveUrl(request.getLiveUrl())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .build();
        projectRepository.save(project);
        return mapToProjectDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long userId, Long id, ProjectRequest request) {
        Profile profile = getProfileByUserId(userId);
        Project project = projectRepository.findById(id).orElseThrow(() -> new NotFoundException("Project not found"));
        if (!project.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setTechStack(request.getTechStack());
        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());
        project.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        project.setIsVisible(request.getIsVisible() != null ? request.getIsVisible() : true);
        projectRepository.save(project);
        return mapToProjectDto(project);
    }

    @Transactional
    public void deleteProject(Long userId, Long id) {
        Profile profile = getProfileByUserId(userId);
        Project project = projectRepository.findById(id).orElseThrow(() -> new NotFoundException("Project not found"));
        if (!project.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        projectRepository.delete(project);
    }

    @Transactional
    public void reorderProjects(Long userId, List<Long> orderedIds) {
        Profile profile = getProfileByUserId(userId);
        List<Project> items = projectRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            projectRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }

    // ==========================================
    // MAPPERS
    // ==========================================
    private ProfileDto mapToProfileDto(Profile profile) {
        ProfileDto dto = new ProfileDto();
        dto.setId(profile.getId());
        dto.setFullName(profile.getFullName());
        dto.setHeadline(profile.getHeadline());
        dto.setSummary(profile.getSummary());
        dto.setAvatarUrl(profile.getAvatarUrl());
        dto.setLocation(profile.getLocation());
        dto.setWebsite(profile.getWebsite());
        dto.setGithubUsername(profile.getGithubUsername());
        dto.setTelegram(profile.getTelegram());
        dto.setLinkedin(profile.getLinkedin());
        dto.setSectionOrder(profile.getSectionOrder());
        
        dto.setExperience(experienceRepository.findByProfileIdOrderBySortOrderAsc(profile.getId())
                .stream().map(this::mapToExperienceDto).collect(Collectors.toList()));
        dto.setEducation(educationRepository.findByProfileIdOrderBySortOrderAsc(profile.getId())
                .stream().map(this::mapToEducationDto).collect(Collectors.toList()));
        dto.setSkills(skillRepository.findByProfileIdOrderBySortOrderAsc(profile.getId())
                .stream().map(this::mapToSkillDto).collect(Collectors.toList()));
        dto.setLanguages(languageRepository.findByProfileIdOrderBySortOrderAsc(profile.getId())
                .stream().map(this::mapToLanguageDto).collect(Collectors.toList()));
        dto.setProjects(projectRepository.findByProfileIdOrderBySortOrderAsc(profile.getId())
                .stream().map(this::mapToProjectDto).collect(Collectors.toList()));
        return dto;
    }
    
    private ExperienceDto mapToExperienceDto(Experience exp) {
        ExperienceDto dto = new ExperienceDto();
        dto.setId(exp.getId());
        dto.setCompany(exp.getCompany());
        dto.setPosition(exp.getPosition());
        dto.setDescription(exp.getDescription());
        dto.setTechStack(exp.getTechStack());
        dto.setStartDate(exp.getStartDate());
        dto.setEndDate(exp.getEndDate());
        dto.setIsCurrent(exp.getIsCurrent());
        dto.setSortOrder(exp.getSortOrder());
        return dto;
    }

    private EducationDto mapToEducationDto(Education edu) {
        EducationDto dto = new EducationDto();
        dto.setId(edu.getId());
        dto.setInstitution(edu.getInstitution());
        dto.setDegree(edu.getDegree());
        dto.setField(edu.getField());
        dto.setStartDate(edu.getStartDate());
        dto.setEndDate(edu.getEndDate());
        dto.setIsCurrent(edu.getIsCurrent());
        dto.setSortOrder(edu.getSortOrder());
        return dto;
    }

    private SkillDto mapToSkillDto(Skill skill) {
        SkillDto dto = new SkillDto();
        dto.setId(skill.getId());
        dto.setName(skill.getName());
        dto.setCategory(skill.getCategory());
        dto.setLevel(skill.getLevel());
        dto.setSortOrder(skill.getSortOrder());
        return dto;
    }

    private LanguageDto mapToLanguageDto(Language lang) {
        LanguageDto dto = new LanguageDto();
        dto.setId(lang.getId());
        dto.setName(lang.getName());
        dto.setLevel(lang.getLevel());
        dto.setSortOrder(lang.getSortOrder());
        return dto;
    }

    private ProjectDto mapToProjectDto(Project project) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setTechStack(project.getTechStack());
        dto.setGithubUrl(project.getGithubUrl());
        dto.setLiveUrl(project.getLiveUrl());
        dto.setStars(project.getStars());
        dto.setIsFeatured(project.getIsFeatured());
        dto.setIsVisible(project.getIsVisible());
        dto.setSortOrder(project.getSortOrder());
        return dto;
    }

    // ==========================================
    // GITHUB IMPORTS
    // ==========================================
    @Transactional
    public void updateFromGitHub(Long userId, com.medev.modules.github.dto.GitHubProfileDto github) {
        Profile profile = getProfileByUserId(userId);
        
        if (github.getName() != null && profile.getFullName() == null) profile.setFullName(github.getName());
        if (github.getAvatarUrl() != null) profile.setAvatarUrl(github.getAvatarUrl());
        if (github.getLocation() != null && profile.getLocation() == null) profile.setLocation(github.getLocation());
        if (github.getBio() != null && profile.getSummary() == null) profile.setSummary(github.getBio());
        
        profile.setGithubUsername(github.getUsername());
        profileRepository.save(profile);
    }

    @Transactional
    public void importProjects(Long userId, List<com.medev.modules.github.dto.GitHubRepoDto> repos) {
        Profile profile = getProfileByUserId(userId);
        for (com.medev.modules.github.dto.GitHubRepoDto repo : repos) {
            Project project = Project.builder()
                    .profile(profile)
                    .name(repo.getName())
                    .description(repo.getDescription())
                    .githubUrl(repo.getHtmlUrl())
                    .techStack(repo.getLanguage())
                    .build();
            projectRepository.save(project);
        }
    }

    @Transactional
    public void addSkillIfNotExists(Long userId, String skillName, String category) {
        Profile profile = getProfileByUserId(userId);
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
