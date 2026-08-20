package com.medev.modules.ai.service;

import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.entity.Project;
import com.medev.modules.profile.entity.Experience;
import com.medev.modules.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.context.event.EventListener;
import com.medev.modules.profile.event.ProfileUpdatedEvent;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VectorizationService {

    private final VectorStore vectorStore;
    private final ProfileRepository profileRepository;
    private final JdbcTemplate jdbcTemplate;

    private final org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @Async
    @EventListener
    public void onProfileUpdated(ProfileUpdatedEvent event) {
        vectorizeUserProfile(event.getUserId());
    }

    public void vectorizeUserProfile(Long userId) {
        log.info("Starting background vectorization for user ID: {}", userId);
        
        List<Document> documents = transactionTemplate.execute(status -> {
            List<Document> docs = new ArrayList<>();
            Optional<Profile> optProfile = profileRepository.findByUserId(userId);
            if (optProfile.isEmpty()) {
                return docs;
            }
            
            Profile profile = optProfile.get();

            // Add Projects
            for (Project project : profile.getProjects()) {
                String content = String.format("Project: %s. Tech Stack: %s. Description: %s", 
                        project.getName(), 
                        project.getTechStack() != null ? project.getTechStack() : "N/A", 
                        project.getDescription() != null ? project.getDescription() : "N/A");
                
                Document doc = new Document(content, Map.of(
                        "userId", String.valueOf(userId),
                        "type", "PROJECT",
                        "projectId", String.valueOf(project.getId())
                ));
                docs.add(doc);
            }

            // Add Experiences
            for (Experience exp : profile.getExperiences()) {
                String content = String.format("Role: %s at %s. Tech Stack: %s. Description: %s", 
                        exp.getPosition(), 
                        exp.getCompany(),
                        exp.getTechStack() != null ? exp.getTechStack() : "N/A",
                        exp.getDescription() != null ? exp.getDescription() : "N/A");
                
                Document doc = new Document(content, Map.of(
                        "userId", String.valueOf(userId),
                        "type", "EXPERIENCE",
                        "experienceId", String.valueOf(exp.getId())
                ));
                docs.add(doc);
            }
            return docs;
        });

        if (documents.isEmpty()) {
            log.info("No projects or experiences to vectorize for user {}", userId);
            return;
        }

        try {
            // Delete old vectors for this user
            jdbcTemplate.update("DELETE FROM vector_store WHERE metadata->>'userId' = ?", String.valueOf(userId));
            
            // Add new vectors
            vectorStore.add(documents);
            log.info("Successfully vectorized {} items for user {}", documents.size(), userId);
        } catch (Exception e) {
            log.error("Failed to vectorize profile for user {}: {}", userId, e.getMessage(), e);
        }
    }

    /**
     * Periodically cleans up orphaned vectors in pgvector.
     * Runs daily at 3 AM.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOrphanedVectors() {
        log.info("Starting cleanup of orphaned vectors...");
        try {
            int deleted = jdbcTemplate.update(
                "DELETE FROM vector_store vs " +
                "WHERE NOT EXISTS (" +
                "  SELECT 1 FROM users u WHERE CAST(u.id AS VARCHAR) = vs.metadata->>'userId'" +
                ")"
            );
            log.info("Cleaned up {} orphaned vectors", deleted);
        } catch (Exception e) {
            log.error("Failed to cleanup orphaned vectors: {}", e.getMessage(), e);
        }
    }
}
