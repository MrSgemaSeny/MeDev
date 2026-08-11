package com.medev.modules.ai.controller;

import com.medev.modules.ai.service.AiAnalysisService;
import com.medev.modules.ai.service.AiAssistantService;
import com.medev.modules.ai.service.AiContextService;
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

import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.auth.entity.User;
import com.medev.shared.exception.ForbiddenException;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAnalysisService aiAnalysisService;
    private final AiAssistantService aiAssistantService;
    private final AiContextService aiContextService;
    private final ProfileService profileService;
    private final UserRepository userRepository;

    @PostMapping("/parse-resume")
    public ResponseEntity<UpdateProfileRequest> parseResume(@RequestParam("file") MultipartFile file) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getPlan() == User.Plan.FREE) {
            throw new ForbiddenException("AI Resume Parsing is only available for PRO users.");
        }

        UpdateProfileRequest parsedProfile = aiAnalysisService.parseResumePdf(file);
        profileService.update(userId, parsedProfile);

        return ResponseEntity.ok(parsedProfile);
    }

    @PostMapping("/chat/stream")
    public SseEmitter streamChat(@RequestBody ChatRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        String systemPrompt = aiContextService.buildSystemPrompt(userId);

        SseEmitter emitter = new SseEmitter(120_000L); // 2 minutes timeout
        
        Flux<String> stream = aiAssistantService.streamChat(request.getPrompt(), systemPrompt, request.getHistory());
        
        stream.subscribe(
            chunk -> {
                try {
                    emitter.send(chunk);
                } catch (Exception e) {
                    emitter.complete();
                }
            },
            error -> {
                System.err.println("AI Stream Error: " + error.getMessage());
                emitter.complete(); // Cleanly close the stream on the frontend even if backend WebClient throws PrematureCloseException
            },
            emitter::complete
        );
        
        return emitter;
    }
}
