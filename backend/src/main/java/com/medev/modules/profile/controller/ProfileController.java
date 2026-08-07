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

    @PostMapping("/experience")
    public ResponseEntity<ExperienceDto> addExperience(@Valid @RequestBody ExperienceRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.addExperience(userId, request));
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<ExperienceDto> updateExperience(
            @PathVariable Long id,
            @Valid @RequestBody ExperienceRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.updateExperience(userId, id, request));
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        profileService.deleteExperience(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/experience/reorder")
    public ResponseEntity<Void> reorderExperience(@RequestBody ReorderRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        profileService.reorderExperience(userId, request.getIds());
        return ResponseEntity.noContent().build();
    }
}
