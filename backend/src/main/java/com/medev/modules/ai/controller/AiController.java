package com.medev.modules.ai.controller;

import com.medev.modules.ai.service.AiAnalysisService;
import com.medev.modules.ai.service.AiAssistantService;
import com.medev.modules.ai.dto.ChatRequest;
import com.medev.modules.profile.dto.UpdateProfileRequest;
import com.medev.modules.profile.service.ProfileService;
import com.medev.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAnalysisService aiAnalysisService;
    private final AiAssistantService aiAssistantService;
    private final ProfileService profileService;

    @PostMapping("/parse-resume")
    public ResponseEntity<UpdateProfileRequest> parseResume(@RequestParam("file") MultipartFile file) {
        UpdateProfileRequest parsedProfile = aiAnalysisService.parseResumePdf(file);
        
        Long userId = SecurityUtils.getCurrentUserId();
        profileService.update(userId, parsedProfile);

        return ResponseEntity.ok(parsedProfile);
    }

    @PostMapping("/chat/stream")
    public SseEmitter streamChat(@RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(120_000L); // 2 minutes timeout
        
        Flux<String> stream = aiAssistantService.streamChat(request.getPrompt(), request.getHistory());
        
        stream.subscribe(
            chunk -> {
                try {
                    emitter.send(chunk);
                } catch (Exception e) {
                    emitter.completeWithError(e);
                }
            },
            emitter::completeWithError,
            emitter::complete
        );
        
        return emitter;
    }
}
