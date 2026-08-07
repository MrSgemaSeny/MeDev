package com.medev.modules.profile.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.entity.Experience;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.repository.ExperienceRepository;
import com.medev.modules.profile.repository.ProfileRepository;
import com.medev.shared.exception.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ExperienceRepository experienceRepository;

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
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

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
    public ExperienceDto updateExperience(Long userId, Long experienceId, ExperienceRequest request) {
        Profile profile = getProfileByUserId(userId);
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));
                
        if (!exp.getProfile().getId().equals(profile.getId())) {
            throw new ForbiddenException("Access denied");
        }
        
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
    public void deleteExperience(Long userId, Long experienceId) {
        Profile profile = getProfileByUserId(userId);
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));
                
        if (!exp.getProfile().getId().equals(profile.getId())) {
            throw new ForbiddenException("Access denied");
        }
        
        experienceRepository.delete(exp);
    }

    @Transactional
    public void reorderExperience(Long userId, List<Long> orderedIds) {
        Profile profile = getProfileByUserId(userId);
        
        List<Experience> experiences = experienceRepository.findAllById(orderedIds);
        boolean allBelongToProfile = experiences.stream()
                .allMatch(e -> e.getProfile().getId().equals(profile.getId()));
                
        if (!allBelongToProfile || experiences.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        
        for (int i = 0; i < orderedIds.size(); i++) {
            experienceRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }

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
}
