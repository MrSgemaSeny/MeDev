package com.medev.modules.ai.service;

import com.medev.modules.ai.entity.AiUsage;
import com.medev.modules.ai.repository.AiUsageRepository;
import com.medev.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenAccountingService {

    private final AiUsageRepository aiUsageRepository;
    private final UserRepository userRepository;

    @Async
    public void recordUsageAsync(Long userId, String model, int promptTokens, int completionTokens, int totalTokens, String endpoint) {
        try {
            userRepository.findById(userId).ifPresent(user -> {
                AiUsage usage = AiUsage.builder()
                        .user(user)
                        .model(model)
                        .promptTokens(promptTokens)
                        .completionTokens(completionTokens)
                        .totalTokens(totalTokens)
                        .endpoint(endpoint)
                        .build();
                aiUsageRepository.save(usage);
                log.debug("Recorded AI usage for user {}: {} tokens", userId, totalTokens);
            });
        } catch (Exception e) {
            log.warn("Failed to record AI usage for user {}: {}", userId, e.getMessage());
        }
    }
}
