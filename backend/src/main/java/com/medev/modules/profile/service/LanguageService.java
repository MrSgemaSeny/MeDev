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

    public static final java.util.Set<String> PROGRAMMING_LANGUAGES = java.util.Set.of(
            // Языки программирования
            "java", "python", "javascript", "typescript", "c++", "cpp", "c#", "csharp", "c", "golang", "go",
            "rust", "php", "ruby", "kotlin", "swift", "scala", "dart", "groovy", "lua", "perl",
            "elixir", "clojure", "haskell", "solidity", "r", "matlab", "cobol", "fortran",
            "assembly", "asm", "vhdl",
            // Web
            "html", "css", "scss", "less", "graphql",
            // Data / Query
            "sql", "nosql",
            // DevOps / Config / IaC
            "shell", "bash", "sh", "zsh", "powershell", "dockerfile", "docker",
            "yaml", "yml", "json", "xml", "makefile", "terraform", "hcl", "bicep", "nix",
            // Markup / Schema
            "markdown", "md", "protobuf", "toml"
    );

    public static boolean isProgrammingLanguage(String name) {
        if (name == null || name.isBlank()) return false;
        return PROGRAMMING_LANGUAGES.contains(name.trim().toLowerCase());
    }

    private void validateNotProgrammingLanguage(String name) {
        if (isProgrammingLanguage(name)) {
            throw new IllegalArgumentException(
                    "Programming languages ('" + name + "') belong in Skills, not in spoken Languages."
            );
        }
    }

    @Transactional
    public LanguageDto addLanguage(Long userId, LanguageRequest request) {
        validateNotProgrammingLanguage(request.getName());
        Profile profile = profileService.getProfileEntityForUpdate(userId);
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
        validateNotProgrammingLanguage(request.getName());
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        Language lang = languageRepository.findById(id).orElseThrow(() -> new NotFoundException("Language not found"));
        if (!lang.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        lang.setName(request.getName());
        lang.setLevel(request.getLevel());
        languageRepository.save(lang);
        return profileMapper.toDto(lang);
    }

    @Transactional
    public void deleteLanguage(Long userId, Long id) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        Language lang = languageRepository.findById(id).orElseThrow(() -> new NotFoundException("Language not found"));
        if (!lang.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        languageRepository.delete(lang);
    }

    @Transactional
    public void reorderLanguages(Long userId, List<Long> orderedIds) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        List<Language> items = languageRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            languageRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }
}
