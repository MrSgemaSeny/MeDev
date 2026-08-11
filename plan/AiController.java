package com.medev.modules.ai.controller;

import com.medev.modules.ai.dto.ChatRequest;
import com.medev.modules.ai.dto.GenerateRequest;
import com.medev.modules.ai.dto.QuotaResponse;
import com.medev.modules.ai.model.LlmException;
import com.medev.modules.ai.service.*;
import com.medev.modules.profile.dto.UpdateProfileRequest;
import com.medev.modules.profile.service.ProfileService;
import com.medev.shared.exception.TooManyRequestsException;
import com.medev.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;

@Slf4j
@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAnalysisService   aiAnalysisService;
    private final AiAssistantService  aiAssistantService;
    private final AiContextService    aiContextService;
    private final AiGenerateService   aiGenerateService;
    private final AiRateLimiter       aiRateLimiter;
    private final ProfileService      profileService;

    // ─────────────────────────────────────────────────
    // QUOTA
    // ─────────────────────────────────────────────────

    /**
     * Сколько AI-запросов осталось у пользователя сегодня.
     * Фронт показывает это в UI.
     */
    @GetMapping("/quota")
    public ResponseEntity<QuotaResponse> getQuota() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(new QuotaResponse(
                aiRateLimiter.getRemainingRequests(userId),
                aiRateLimiter.getDailyLimit(userId)
        ));
    }

    // ─────────────────────────────────────────────────
    // CHAT / ASSISTANT
    // ─────────────────────────────────────────────────

    /**
     * Стриминг чата с AI-ассистентом.
     * Rate limited по userId.
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@RequestBody ChatRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        // Проверка лимита ПЕРЕД обращением к Groq
        aiRateLimiter.checkAndConsume(userId);

        String systemPrompt = aiContextService.buildAssistantSystemPrompt(userId);
        SseEmitter emitter = new SseEmitter(120_000L);

        Flux<String> stream = aiAssistantService.streamChat(
                sanitize(request.getPrompt()),
                systemPrompt,
                request.getHistory()
        );

        stream.subscribe(
            chunk -> {
                try {
                    emitter.send(chunk);
                } catch (Exception e) {
                    emitter.complete();
                }
            },
            error -> {
                log.error("[AiController] Stream error for user {}: {}", userId, error.getMessage());
                try {
                    // Отправляем структурированную ошибку фронту вместо silent fail
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data(friendlyError(error)));
                } catch (Exception ignored) {}
                emitter.complete();
            },
            emitter::complete
        );

        return emitter;
    }

    // ─────────────────────────────────────────────────
    // GENERATE (структурированные генерации)
    // ─────────────────────────────────────────────────

    /**
     * Генерация professional summary.
     * Возвращает текст, не JSON.
     */
    @PostMapping("/generate/summary")
    public ResponseEntity<String> generateSummary(@RequestBody GenerateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);

        String context = aiContextService.buildUserContextBlock(userId);
        String result = aiGenerateService.generateSummary(context, request.getLanguage());
        return ResponseEntity.ok(result);
    }

    /**
     * Генерация описания проекта.
     */
    @PostMapping("/generate/project-description")
    public ResponseEntity<String> generateProjectDescription(@RequestBody GenerateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);

        String context = aiContextService.buildUserContextBlock(userId);
        String result = aiGenerateService.generateProjectDescription(
                context, request.getProjectName(), request.getLanguage()
        );
        return ResponseEntity.ok(result);
    }

    // ─────────────────────────────────────────────────
    // PARSE RESUME
    // ─────────────────────────────────────────────────

    @PostMapping("/parse-resume")
    public ResponseEntity<UpdateProfileRequest> parseResume(@RequestParam("file") MultipartFile file) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);

        // File size guard — не ждём пока AI схарчит огромный файл
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            return ResponseEntity.badRequest().build();
        }

        UpdateProfileRequest parsed = aiAnalysisService.parseResumePdf(file);
        profileService.update(userId, parsed);
        return ResponseEntity.ok(parsed);
    }

    // ─────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────

    /**
     * Базовая защита от prompt injection через user input.
     * Обрезает до разумного размера — не даём пользователю раздуть промпт.
     */
    private String sanitize(String input) {
        if (input == null) return "";
        // Максимум 2000 символов на один user-message
        return input.length() > 2000 ? input.substring(0, 2000) : input.trim();
    }

    private String friendlyError(Throwable e) {
        if (e instanceof LlmException llm) {
            return switch (llm.getReason()) {
                case RATE_LIMITED         -> "AI сервис временно перегружен. Попробуйте через минуту.";
                case PROVIDER_UNAVAILABLE -> "AI недоступен. Попробуйте позже.";
                case CIRCUIT_OPEN         -> "AI временно отключён из-за ошибок. Попробуйте через 30 секунд.";
                case TIMEOUT              -> "Генерация заняла слишком много времени. Попробуйте снова.";
                default                   -> "Ошибка AI. Попробуйте снова.";
            };
        }
        if (e instanceof TooManyRequestsException) return e.getMessage();
        return "Произошла ошибка. Попробуйте позже.";
    }
}
