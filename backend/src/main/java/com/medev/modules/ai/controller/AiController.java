package com.medev.modules.ai.controller;

import com.medev.modules.ai.service.AiAnalysisService;
import com.medev.modules.profile.dto.UpdateProfileRequest;
import com.medev.modules.profile.service.ProfileService;
import com.medev.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAnalysisService aiAnalysisService;
    private final ProfileService profileService;

    @PostMapping("/parse-resume")
    public ResponseEntity<UpdateProfileRequest> parseResume(@RequestParam("file") MultipartFile file) {
        UpdateProfileRequest parsedProfile = aiAnalysisService.parseResumePdf(file);
        
        // Автоматически применяем распарсенные данные к профилю пользователя
        Long userId = SecurityUtils.getCurrentUserId();
        profileService.update(userId, parsedProfile);

        return ResponseEntity.ok(parsedProfile);
    }
}
