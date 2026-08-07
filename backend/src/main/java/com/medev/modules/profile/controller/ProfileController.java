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

    @GetMapping
    public ResponseEntity<ProfileDto> getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.getByUserId(userId));
    }

    @PutMapping
    public ResponseEntity<ProfileDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.update(userId, request));
    }

    // ================= EXPERIENCE =================
    @PostMapping("/experience")
    public ResponseEntity<ExperienceDto> addExperience(@Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.addExperience(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<ExperienceDto> updateExperience(@PathVariable Long id, @Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.ok(profileService.updateExperience(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id) {
        profileService.deleteExperience(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/experience/reorder")
    public ResponseEntity<Void> reorderExperience(@RequestBody ReorderRequest request) {
        profileService.reorderExperience(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }

    // ================= EDUCATION =================
    @PostMapping("/education")
    public ResponseEntity<EducationDto> addEducation(@Valid @RequestBody EducationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.addEducation(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<EducationDto> updateEducation(@PathVariable Long id, @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.ok(profileService.updateEducation(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long id) {
        profileService.deleteEducation(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/education/reorder")
    public ResponseEntity<Void> reorderEducation(@RequestBody ReorderRequest request) {
        profileService.reorderEducation(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }

    // ================= SKILLS =================
    @PostMapping("/skills")
    public ResponseEntity<SkillDto> addSkill(@Valid @RequestBody SkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.addSkill(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/skills/{id}")
    public ResponseEntity<SkillDto> updateSkill(@PathVariable Long id, @Valid @RequestBody SkillRequest request) {
        return ResponseEntity.ok(profileService.updateSkill(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        profileService.deleteSkill(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/skills/reorder")
    public ResponseEntity<Void> reorderSkills(@RequestBody ReorderRequest request) {
        profileService.reorderSkills(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }

    // ================= LANGUAGES =================
    @PostMapping("/languages")
    public ResponseEntity<LanguageDto> addLanguage(@Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.addLanguage(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/languages/{id}")
    public ResponseEntity<LanguageDto> updateLanguage(@PathVariable Long id, @Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.ok(profileService.updateLanguage(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/languages/{id}")
    public ResponseEntity<Void> deleteLanguage(@PathVariable Long id) {
        profileService.deleteLanguage(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/languages/reorder")
    public ResponseEntity<Void> reorderLanguages(@RequestBody ReorderRequest request) {
        profileService.reorderLanguages(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }

    // ================= PROJECTS =================
    @PostMapping("/projects")
    public ResponseEntity<ProjectDto> addProject(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.addProject(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(profileService.updateProject(SecurityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        profileService.deleteProject(SecurityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/projects/reorder")
    public ResponseEntity<Void> reorderProjects(@RequestBody ReorderRequest request) {
        profileService.reorderProjects(SecurityUtils.getCurrentUserId(), request.getIds());
        return ResponseEntity.noContent().build();
    }
}
