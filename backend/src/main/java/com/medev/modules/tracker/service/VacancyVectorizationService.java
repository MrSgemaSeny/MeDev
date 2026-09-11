package com.medev.modules.tracker.service;

import com.medev.modules.ai.embedding.JinaEmbeddingClient;
import com.medev.modules.ai.embedding.PgVectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyVectorizationService {

    private final JinaEmbeddingClient jinaEmbeddingClient;
    private final PgVectorRepository pgVectorRepository;

    /**
     * Asynchronously vectorizes a vacancy description, stores its 768-dim vector,
     * and calculates the cosine match score against the candidate's aggregated profile vector.
     *
     * @param userId           The user ID who owns the application
     * @param jobApplicationId The job application ID
     * @param jobDescription   The text description of the vacancy
     */
    @Async("vectorizationExecutor")
    public void vectorizeAndMatch(Long userId, Long jobApplicationId, String jobDescription) {
        if (userId == null || jobApplicationId == null || jobDescription == null || jobDescription.isBlank()) {
            return;
        }

        try {
            log.info("Vectorizing vacancy for jobApplicationId={}, userId={}", jobApplicationId, userId);

            // 1. Embed vacancy description via Jina AI
            List<float[]> embeddings = jinaEmbeddingClient.embed(List.of(jobDescription.trim()));
            if (embeddings.isEmpty() || embeddings.get(0) == null) {
                log.warn("Empty embedding received for jobApplicationId={}", jobApplicationId);
                return;
            }

            float[] vacancyVector = embeddings.get(0);

            // 2. Save vector to job_applications table
            pgVectorRepository.saveVacancyEmbedding(jobApplicationId, vacancyVector);

            // 3. Fetch aggregated profile vector of candidate
            float[] profileVector = pgVectorRepository.getAggregatedProfileVector(userId);
            if (profileVector == null || profileVector.length == 0) {
                log.info("User {} has no vectorized profile chunks yet. matchScore skipped.", userId);
                return;
            }

            // 4. Calculate Cosine Similarity and clamp to [0, 100]
            float similarity = PgVectorRepository.calculateCosineSimilarity(vacancyVector, profileVector);
            int matchScore = Math.min(100, Math.max(0, Math.round(similarity * 100)));

            // 5. Persist via repository — tracker service must not own raw JDBC
            pgVectorRepository.updateMatchScore(jobApplicationId, matchScore);
            log.info("Calculated matchScore={} for jobApplicationId={}", matchScore, jobApplicationId);

        } catch (Exception e) {
            log.error("Failed to vectorize and match jobApplicationId={}: {}", jobApplicationId, e.getMessage(), e);
        }
    }
}
