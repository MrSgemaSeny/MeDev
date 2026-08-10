package com.medev.modules.profile.service;

import com.medev.modules.profile.dto.LanguageDto;
import com.medev.modules.profile.dto.LanguageRequest;
import com.medev.modules.profile.dto.ProfileMapper;
import com.medev.modules.profile.entity.Language;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.repository.LanguageRepository;
import com.medev.shared.exception.ForbiddenException;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LanguageService {

    private final LanguageRepository languageRepository;
    private final ProfileMapper profileMapper;
    private final ProfileService profileService;

    @Transactional
    public LanguageDto addLanguage(Long userId, LanguageRequest request) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        Language lang = Language.builder()
                .profile(profile)
                .name(request.getName())
                .level(request.getLevel())
                .build();
        languageRepository.save(lang);
        return profileMapper.toDto(lang);
    }

    @Transactional
    public LanguageDto updateLanguage(Long userId, Long id, LanguageRequest request) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        Language lang = languageRepository.findById(id).orElseThrow(() -> new NotFoundException("Language not found"));
        if (!lang.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        lang.setName(request.getName());
        lang.setLevel(request.getLevel());
        languageRepository.save(lang);
        return profileMapper.toDto(lang);
    }

    @Transactional
    public void deleteLanguage(Long userId, Long id) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        Language lang = languageRepository.findById(id).orElseThrow(() -> new NotFoundException("Language not found"));
        if (!lang.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        languageRepository.delete(lang);
    }

    @Transactional
    public void reorderLanguages(Long userId, List<Long> orderedIds) {
        Profile profile = profileService.getProfileEntityByUserId(userId);
        List<Language> items = languageRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            languageRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }
}
