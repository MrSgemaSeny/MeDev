package com.medev.modules.ai.service;

import com.medev.modules.ai.dto.EvaluationRequest;
import com.medev.modules.ai.entity.AiEvaluation;
import com.medev.modules.ai.repository.AiEvaluationRepository;
import com.medev.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final AiEvaluationRepository evaluationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void saveFeedback(Long userId, EvaluationRequest request) {
        userRepository.findById(userId).ifPresent(user -> {
            AiEvaluation evaluation = AiEvaluation.builder()
                    .user(user)
                    .endpoint(request.getEndpoint())
                    .isPositive(request.getIsPositive())
                    .generatedText(request.getGeneratedText())
                    .notes(request.getNotes())
                    .build();
            evaluationRepository.save(evaluation);
            log.debug("Saved AI feedback for user {}: {}", userId, request.getIsPositive() ? "Positive" : "Negative");
        });
    }
}
