package com.medev.modules.ai.controller;

import com.medev.modules.ai.dto.ChatRequest;
import com.medev.modules.ai.dto.GenerateRequest;
import com.medev.modules.ai.dto.QuotaResponse;
import com.medev.modules.ai.model.LlmException;
import com.medev.modules.ai.dto.AiParsedResumeDto;
import com.medev.modules.ai.service.*;
import com.medev.modules.profile.dto.UpdateProfileRequest;
import com.medev.modules.profile.dto.ProfileDto;
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
    private final AiOnboardingService aiOnboardingService;
    private final AiApplicationService aiApplicationService;
    private final AiRateLimiter       aiRateLimiter;
    private final ProfileService      profileService;
    private final EvaluationService   evaluationService;
    private final com.medev.modules.github.repository.GithubSnapshotRepository snapshotRepository;

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
                (int) aiRateLimiter.getRemainingRequests(userId),
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
    @PostMapping(value = "/generate/summary", produces = MediaType.APPLICATION_JSON_VALUE)
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
    @PostMapping(value = "/generate/project-description", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> generateProjectDescription(@RequestBody GenerateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);

        String context = aiContextService.buildUserContextBlock(userId);
        String result = aiGenerateService.generateProjectDescription(
                context, request.getProjectName(), request.getLanguage()
        );
        return ResponseEntity.ok(result);
    }

    /**
     * Экспорт LinkedIn About секции.
     */
    @GetMapping(value = "/export/linkedin", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> exportLinkedinProfile(@RequestParam(defaultValue = "en") String language) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);

        String context = aiContextService.buildUserContextBlock(userId);
        String result = aiGenerateService.generateLinkedinProfile(context, language);
        return ResponseEntity.ok(result);
    }

    /**
     * AI Onboarding Wizard
     * Генерирует и сохраняет профиль пользователя (Bio, Headline, Skills, Experience)
     */
    @PostMapping(value = "/onboarding", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<com.medev.modules.ai.dto.AiOnboardingResponse> generateOnboarding(@RequestBody com.medev.modules.ai.dto.AiOnboardingRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);

        com.medev.modules.ai.dto.AiOnboardingResponse response = aiOnboardingService.generateAndSaveProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Генерация полного профиля на основе GitHub Snapshot.
     */
    @PostMapping(value = "/generate-profile", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProfileDto> generateFullProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);

        String snapshotJson = snapshotRepository.findFirstByIdUserIdOrderByIdFetchedAtDesc(userId)
                .map(com.medev.modules.github.entity.GithubSnapshot::getRawJson)
                .orElse("{}");

        ProfileDto currentProfile = profileService.getByUserId(userId);
        AiParsedResumeDto parsed = aiAnalysisService.generateFullProfile(userId, snapshotJson, currentProfile);
        ProfileDto updatedProfile = profileService.importParsedResume(userId, parsed);
        return ResponseEntity.ok(updatedProfile);
    }

    // ─────────────────────────────────────────────────
    // APPLICATION (Cover Letter & Tailor - Pro Features)
    // ─────────────────────────────────────────────────

    @PostMapping(value = "/cover-letter", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<com.medev.modules.ai.dto.AiApplicationResponse> generateCoverLetter(@RequestBody com.medev.modules.ai.dto.AiApplicationRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);
        
        com.medev.modules.ai.dto.AiApplicationResponse response = aiApplicationService.generateCoverLetter(userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/tailor", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<com.medev.modules.ai.dto.AiApplicationResponse> tailorResume(@RequestBody com.medev.modules.ai.dto.AiApplicationRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);
        
        com.medev.modules.ai.dto.AiApplicationResponse response = aiApplicationService.tailorResume(userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/match-job", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<com.medev.modules.ai.dto.AiMatchResponse> matchJob(@RequestBody java.util.Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);
        
        String jobDescription = body.get("jobDescription");
        if (jobDescription == null || jobDescription.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        
        com.medev.modules.ai.dto.AiMatchResponse response = aiApplicationService.matchJob(userId, jobDescription);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────
    // PARSE RESUME
    // ─────────────────────────────────────────────────

    @PostMapping("/parse-resume")
    public ResponseEntity<ProfileDto> parseResume(@RequestParam("file") MultipartFile file) {
        Long userId = SecurityUtils.getCurrentUserId();
        aiRateLimiter.checkAndConsume(userId);

        if (file.getSize() > 10 * 1024 * 1024) { 
            return ResponseEntity.badRequest().build();
        }

        ProfileDto currentProfile = profileService.getByUserId(userId);
        AiParsedResumeDto parsed = aiAnalysisService.parseResumePdf(file, currentProfile);
        ProfileDto updatedProfile = profileService.importParsedResume(userId, parsed);
        return ResponseEntity.ok(updatedProfile);
    }

    // ─────────────────────────────────────────────────
    // FEEDBACK & EVALUATION
    // ─────────────────────────────────────────────────

    @PostMapping("/feedback")
    public ResponseEntity<Void> submitFeedback(@RequestBody com.medev.modules.ai.dto.EvaluationRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        evaluationService.saveFeedback(userId, request);
        return ResponseEntity.ok().build();
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
