package com.medev.modules.profile.service;

import com.medev.modules.profile.dto.ProfileMapper;
import com.medev.modules.profile.dto.SkillDto;
import com.medev.modules.profile.dto.SkillRequest;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.entity.Skill;
import com.medev.modules.profile.repository.SkillRepository;
import com.medev.shared.exception.ForbiddenException;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final ProfileMapper profileMapper;
    private final ProfileService profileService;

    @Transactional
    public SkillDto addSkill(Long userId, SkillRequest request) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        Skill skill = Skill.builder()
                .profile(profile)
                .name(request.getName())
                .category(request.getCategory())
                .level(request.getLevel())
                .build();
        skillRepository.save(skill);
        return profileMapper.toDto(skill);
    }

    @Transactional
    public SkillDto updateSkill(Long userId, Long id, SkillRequest request) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        Skill skill = skillRepository.findById(id).orElseThrow(() -> new NotFoundException("Skill not found"));
        if (!skill.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        skill.setLevel(request.getLevel());
        skillRepository.save(skill);
        return profileMapper.toDto(skill);
    }

    @Transactional
    public void deleteSkill(Long userId, Long id) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        Skill skill = skillRepository.findById(id).orElseThrow(() -> new NotFoundException("Skill not found"));
        if (!skill.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        skillRepository.delete(skill);
    }

    @Transactional
    public void reorderSkills(Long userId, List<Long> orderedIds) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        List<Skill> items = skillRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            skillRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }
}
