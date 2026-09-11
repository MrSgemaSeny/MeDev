package com.medev.modules.ai.service;

import com.medev.modules.ai.embedding.JinaEmbeddingClient;
import com.medev.modules.ai.embedding.PgVectorRepository;
import com.medev.modules.profile.entity.Experience;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.entity.Project;
import com.medev.modules.profile.event.ProfileUpdatedEvent;
import com.medev.modules.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VectorizationService {

    private final JinaEmbeddingClient jinaEmbeddingClient;
    private final PgVectorRepository pgVectorRepository;
    private final ProfileRepository profileRepository;
    private final TransactionTemplate transactionTemplate;

    private record ProfileChunk(String content, String type, String sourceId) {}

    @Async
    @EventListener
    public void onProfileUpdated(ProfileUpdatedEvent event) {
        vectorizeUserProfile(event.getUserId());
    }

    public void vectorizeUserProfile(Long userId) {
        if (userId == null) {
            return;
        }

        log.info("[VectorizationService] Starting vectorization for user ID: {}", userId);

        List<ProfileChunk> chunks = transactionTemplate.execute(status -> {
            List<ProfileChunk> list = new ArrayList<>();
            Optional<Profile> optProfile = profileRepository.findByUserId(userId);
            if (optProfile.isEmpty()) {
                return list;
            }

            Profile profile = optProfile.get();

            // Add Projects
            if (profile.getProjects() != null) {
                for (Project project : profile.getProjects()) {
                    String content = String.format("Project: %s. Tech Stack: %s. Description: %s",
                            project.getName(),
                            project.getTechStack() != null ? project.getTechStack() : "N/A",
                            project.getDescription() != null ? project.getDescription() : "N/A");

                    list.add(new ProfileChunk(content, "PROJECT", String.valueOf(project.getId())));
                }
            }

            // Add Experiences
            if (profile.getExperiences() != null) {
                for (Experience exp : profile.getExperiences()) {
                    String content = String.format("Role: %s at %s. Tech Stack: %s. Description: %s",
                            exp.getPosition(),
                            exp.getCompany(),
                            exp.getTechStack() != null ? exp.getTechStack() : "N/A",
                            exp.getDescription() != null ? exp.getDescription() : "N/A");

                    list.add(new ProfileChunk(content, "EXPERIENCE", String.valueOf(exp.getId())));
                }
            }

            return list;
        });

        if (chunks == null || chunks.isEmpty()) {
            log.info("[VectorizationService] No projects or experiences to vectorize for user {}", userId);
            pgVectorRepository.upsert(userId, List.of());
            return;
        }

        try {
            List<String> texts = chunks.stream().map(ProfileChunk::content).toList();
            List<float[]> embeddings = jinaEmbeddingClient.embed(texts);

            List<PgVectorRepository.VectorItem> items = new ArrayList<>(chunks.size());
            for (int i = 0; i < chunks.size(); i++) {
                ProfileChunk chunk = chunks.get(i);
                float[] emb = i < embeddings.size() ? embeddings.get(i) : new float[768];
                items.add(new PgVectorRepository.VectorItem(chunk.content(), chunk.type(), chunk.sourceId(), emb));
            }

            pgVectorRepository.upsert(userId, items);
            log.info("[VectorizationService] Successfully vectorized {} items for user {}", items.size(), userId);
        } catch (Exception e) {
            log.error("[VectorizationService] Failed to vectorize profile for user {}: {}", userId, e.getMessage(), e);
        }
    }

    /**
     * Periodically cleans up orphaned vectors in pgvector.
     * Runs daily at 3 AM.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOrphanedVectors() {
        log.info("[VectorizationService] Starting cleanup of orphaned vectors...");
        try {
            int deleted = pgVectorRepository.cleanupOrphanedVectors();
            log.info("[VectorizationService] Cleaned up {} orphaned vectors", deleted);
        } catch (Exception e) {
            log.error("[VectorizationService] Failed to cleanup orphaned vectors: {}", e.getMessage(), e);
        }
    }
}
