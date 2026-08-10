package com.medev.modules.profile.controller;

import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.service.ProfileService;
import com.medev.shared.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final com.medev.modules.profile.service.ExperienceService experienceService;
    private final com.medev.modules.profile.service.EducationService educationService;
    private final com.medev.modules.profile.service.SkillService skillService;
    private final com.medev.modules.profile.service.LanguageService languageService;
    private final com.medev.modules.profile.service.ProjectService projectService;
    private final com.medev.modules.profile.service.ReadmeGeneratorService readmeGeneratorService;

    @GetMapping
    public ResponseEntity<ProfileDto> getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.getByUserId(userId));
    }

    @GetMapping(value = "/readme", produces = "text/markdown;charset=UTF-8")
    public ResponseEntity<String> getReadme() {
        Long userId = SecurityUtils.getCurrentUserId();
        com.medev.modules.profile.entity.Profile profile = profileService.getProfileEntityByUserId(userId);
        String readmeContent = readmeGeneratorService.generateReadme(profile);
        return ResponseEntity.ok(readmeContent);
    }

    @PutMapping
    public ResponseEntity<ProfileDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.update(userId, request));
    }

    @PutMapping("/section-order")
    public ResponseEntity<Void> updateSectionOrder(@RequestBody java.util.Map<String, java.util.List<String>> request) {
        Long userId = SecurityUtils.getCurrentUserId();
        profileService.updateSectionOrder(userId, request.get("sectionOrder"));
        return ResponseEntity.noContent().build();
    }

    // ================= EXPERIENCE =================
    @PostMapping("/experience")
    public ResponseEntity<ExperienceDto> addExperience(@Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(experienceService.addExperience(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<ExperienceDto> updateExperience(@PathVariable Long id, @Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.ok(experienceService.updateExperience(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id) {
        experienceService.deleteExperience(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/experience/reorder")
    public ResponseEntity<Void> reorderExperience(@RequestBody ReorderRequest request) {
        experienceService.reorderExperience(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }

    // ================= EDUCATION =================
    @PostMapping("/education")
    public ResponseEntity<EducationDto> addEducation(@Valid @RequestBody EducationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(educationService.addEducation(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<EducationDto> updateEducation(@PathVariable Long id, @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.ok(educationService.updateEducation(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long id) {
        educationService.deleteEducation(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/education/reorder")
    public ResponseEntity<Void> reorderEducation(@RequestBody ReorderRequest request) {
        educationService.reorderEducation(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }

    // ================= SKILLS =================
    @PostMapping("/skills")
    public ResponseEntity<SkillDto> addSkill(@Valid @RequestBody SkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(skillService.addSkill(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/skills/{id}")
    public ResponseEntity<SkillDto> updateSkill(@PathVariable Long id, @Valid @RequestBody SkillRequest request) {
        return ResponseEntity.ok(skillService.updateSkill(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/skills/reorder")
    public ResponseEntity<Void> reorderSkills(@RequestBody ReorderRequest request) {
        skillService.reorderSkills(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }

    // ================= LANGUAGES =================
    @PostMapping("/languages")
    public ResponseEntity<LanguageDto> addLanguage(@Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(languageService.addLanguage(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/languages/{id}")
    public ResponseEntity<LanguageDto> updateLanguage(@PathVariable Long id, @Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.ok(languageService.updateLanguage(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/languages/{id}")
    public ResponseEntity<Void> deleteLanguage(@PathVariable Long id) {
        languageService.deleteLanguage(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/languages/reorder")
    public ResponseEntity<Void> reorderLanguages(@RequestBody ReorderRequest request) {
        languageService.reorderLanguages(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }

    // ================= PROJECTS =================
    @PostMapping("/projects")
    public ResponseEntity<ProjectDto> addProject(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.addProject(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/projects/reorder")
    public ResponseEntity<Void> reorderProjects(@RequestBody ReorderRequest request) {
        projectService.reorderProjects(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }
}
