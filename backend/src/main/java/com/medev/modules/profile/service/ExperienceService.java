package com.medev.modules.profile.service;

import com.medev.modules.profile.dto.ExperienceDto;
import com.medev.modules.profile.dto.ExperienceRequest;
import com.medev.modules.profile.dto.ProfileMapper;
import com.medev.modules.profile.entity.Experience;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.repository.ExperienceRepository;
import com.medev.shared.exception.ForbiddenException;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final ProfileMapper profileMapper;
    private final ProfileService profileService;

    @Transactional
    public ExperienceDto addExperience(Long userId, ExperienceRequest request) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
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
        return profileMapper.toDto(exp);
    }

    @Transactional
    public ExperienceDto updateExperience(Long userId, Long id, ExperienceRequest request) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
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
        return profileMapper.toDto(exp);
    }

    @Transactional
    public void deleteExperience(Long userId, Long id) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        Experience exp = experienceRepository.findById(id).orElseThrow(() -> new NotFoundException("Experience not found"));
        if (!exp.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        experienceRepository.delete(exp);
    }

    @Transactional
    public void reorderExperience(Long userId, List<Long> orderedIds) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        List<Experience> items = experienceRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            experienceRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }
}
