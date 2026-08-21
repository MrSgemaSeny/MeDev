package com.medev.modules.profile.service;

import com.medev.modules.profile.dto.EducationDto;
import com.medev.modules.profile.dto.EducationRequest;
import com.medev.modules.profile.dto.ProfileMapper;
import com.medev.modules.profile.entity.Education;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.repository.EducationRepository;
import com.medev.shared.exception.ForbiddenException;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EducationService {

    private final EducationRepository educationRepository;
    private final ProfileMapper profileMapper;
    private final ProfileService profileService;

    @Transactional
    public EducationDto addEducation(Long userId, EducationRequest request) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
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
        return profileMapper.toDto(edu);
    }

    @Transactional
    public EducationDto updateEducation(Long userId, Long id, EducationRequest request) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        Education edu = educationRepository.findById(id).orElseThrow(() -> new NotFoundException("Education not found"));
        if (!edu.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        edu.setInstitution(request.getInstitution());
        edu.setDegree(request.getDegree());
        edu.setField(request.getField());
        edu.setStartDate(request.getStartDate());
        edu.setEndDate(request.getEndDate());
        edu.setIsCurrent(request.getIsCurrent() != null ? request.getIsCurrent() : false);
        educationRepository.save(edu);
        return profileMapper.toDto(edu);
    }

    @Transactional
    public void deleteEducation(Long userId, Long id) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        Education edu = educationRepository.findById(id).orElseThrow(() -> new NotFoundException("Education not found"));
        if (!edu.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        educationRepository.delete(edu);
    }

    @Transactional
    public void reorderEducation(Long userId, List<Long> orderedIds) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        List<Education> items = educationRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            educationRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }
}
