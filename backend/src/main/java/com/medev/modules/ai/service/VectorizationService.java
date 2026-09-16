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
            List<PgVectorRepository.ExistingVectorChunk> existingChunks = pgVectorRepository.findExistingChunksByUserId(userId);
            java.util.Map<String, float[]> cachedEmbeddings = new java.util.HashMap<>();
            for (PgVectorRepository.ExistingVectorChunk ec : existingChunks) {
                boolean isCompatible = (ec.version() == null || "v2".equals(ec.version()))
                        && (ec.model() == null || "jina-embeddings-v2-base-en".equals(ec.model()));
                if (isCompatible && ec.chunkHash() != null && ec.embedding() != null) {
                    cachedEmbeddings.put(ec.chunkHash(), ec.embedding());
                }
            }

            List<ProfileChunk> chunksToEmbed = new ArrayList<>();
            List<Integer> chunkIndicesToEmbed = new ArrayList<>();
            float[][] finalEmbeddings = new float[chunks.size()][];

            for (int i = 0; i < chunks.size(); i++) {
                ProfileChunk chunk = chunks.get(i);
                String hash = com.medev.shared.util.CryptoUtils.sha256Hex(chunk.content());
                if (cachedEmbeddings.containsKey(hash)) {
                    finalEmbeddings[i] = cachedEmbeddings.get(hash);
                } else {
                    chunksToEmbed.add(chunk);
                    chunkIndicesToEmbed.add(i);
                }
            }

            if (!chunksToEmbed.isEmpty()) {
                log.info("[VectorizationService] Embedding {} new/modified chunks for user {} (reusing {} cached)",
                        chunksToEmbed.size(), userId, chunks.size() - chunksToEmbed.size());
                List<String> textsToEmbed = chunksToEmbed.stream().map(ProfileChunk::content).toList();
                List<float[]> newEmbeddings = jinaEmbeddingClient.embed(textsToEmbed);
                for (int j = 0; j < chunksToEmbed.size(); j++) {
                    int originalIdx = chunkIndicesToEmbed.get(j);
                    float[] emb = j < newEmbeddings.size() ? newEmbeddings.get(j) : new float[768];
                    finalEmbeddings[originalIdx] = emb;
                }
            } else {
                log.info("[VectorizationService] All {} chunks cached for user {}, 0 external embeddings needed", chunks.size(), userId);
            }

            List<PgVectorRepository.VectorItem> items = new ArrayList<>(chunks.size());
            for (int i = 0; i < chunks.size(); i++) {
                ProfileChunk chunk = chunks.get(i);
                String hash = com.medev.shared.util.CryptoUtils.sha256Hex(chunk.content());
                float[] emb = finalEmbeddings[i] != null ? finalEmbeddings[i] : new float[768];
                items.add(new PgVectorRepository.VectorItem(
                        chunk.content(),
                        chunk.type(),
                        chunk.sourceId(),
                        hash,
                        "jina-embeddings-v2-base-en",
                        "v2",
                        768,
                        emb
                ));
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
