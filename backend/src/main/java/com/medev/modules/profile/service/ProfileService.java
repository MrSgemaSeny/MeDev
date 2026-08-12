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
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final ProfileMapper profileMapper;

    @Transactional
    public void createEmptyProfile(User user) {
        Profile profile = Profile.builder()
                .user(user)
                .isPublic(true)
                .build();
        profileRepository.save(profile);
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
        return mapToProfileDto(profile);
    }

    @Transactional
    public void updateSectionOrder(Long userId, List<String> sectionOrder) {
        Profile profile = getProfileEntityByUserId(userId);
        profile.setSectionOrder(sectionOrder);
        profileRepository.save(profile);
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
    }

    @Transactional
    public void importProjects(Long userId, List<com.medev.modules.github.dto.GitHubRepoDto> repos) {
        Profile profile = getProfileEntityByUserId(userId);
        List<Project> existingProjects = projectRepository.findByProfileIdOrderBySortOrderAsc(profile.getId());

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
            }
        }
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
