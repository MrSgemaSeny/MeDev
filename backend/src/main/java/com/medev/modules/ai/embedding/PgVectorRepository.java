package com.medev.modules.ai.embedding;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Repository
@RequiredArgsConstructor
public class PgVectorRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public record VectorItem(
            String content,
            String type,
            String sourceId,
            float[] embedding
    ) {}

    /**
     * Replaces all vector records for the given user with new vector items.
     *
     * @param userId The ID of the user
     * @param items  The vector items to store
     */
    @Transactional
    public void upsert(Long userId, List<VectorItem> items) {
        if (userId == null) {
            return;
        }

        String userIdStr = String.valueOf(userId);

        // Delete existing vectors for this user
        jdbcTemplate.update("DELETE FROM vector_store WHERE metadata->>'userId' = ?", userIdStr);

        if (items == null || items.isEmpty()) {
            return;
        }

        String sql = "INSERT INTO vector_store (id, content, metadata, embedding) VALUES (?, ?, ?::json, ?::vector)";

        List<Object[]> batchArgs = new ArrayList<>(items.size());
        for (VectorItem item : items) {
            Map<String, String> metadata = new LinkedHashMap<>();
            metadata.put("userId", userIdStr);
            if (item.type() != null) {
                metadata.put("type", item.type());
            }
            if (item.sourceId() != null) {
                metadata.put("sourceId", item.sourceId());
            }

            String metadataJson;
            try {
                metadataJson = objectMapper.writeValueAsString(metadata);
            } catch (Exception e) {
                metadataJson = String.format("{\"userId\":\"%s\"}", userIdStr);
            }

            batchArgs.add(new Object[]{
                    UUID.randomUUID(),
                    item.content(),
                    metadataJson,
                    formatVector(item.embedding())
            });
        }

        jdbcTemplate.batchUpdate(sql, batchArgs);
        log.info("[PgVectorRepository] Successfully saved {} vectors for user {}", items.size(), userId);
    }

    /**
     * Performs cosine distance similarity search (operator <=>) for the given user.
     *
     * @param userId      The user ID whose documents to search
     * @param queryVector The query embedding vector
     * @param topK        Max results to return
     * @return List of matching content strings ordered by similarity
     */
    public List<String> findSimilar(Long userId, float[] queryVector, int topK) {
        if (userId == null || queryVector == null || queryVector.length == 0 || topK <= 0) {
            return List.of();
        }

        String sql = "SELECT content FROM vector_store " +
                "WHERE metadata->>'userId' = ? " +
                "ORDER BY embedding <=> ?::vector " +
                "LIMIT ?";

        try {
            return jdbcTemplate.query(
                    sql,
                    (rs, rowNum) -> rs.getString("content"),
                    String.valueOf(userId),
                    formatVector(queryVector),
                    topK
            );
        } catch (Exception e) {
            log.error("[PgVectorRepository] Failed to execute similarity search for user {}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Periodically cleans up orphaned vector records for deleted users.
     *
     * @return Number of deleted rows
     */
    public int cleanupOrphanedVectors() {
        String sql = "DELETE FROM vector_store vs " +
                "WHERE NOT EXISTS (" +
                "  SELECT 1 FROM users u WHERE CAST(u.id AS VARCHAR) = vs.metadata->>'userId'" +
                ")";
        try {
            return jdbcTemplate.update(sql);
        } catch (Exception e) {
            log.error("[PgVectorRepository] Failed to cleanup orphaned vectors: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Formats a float array into PostgreSQL pgvector string format: [0.1,0.2,...]
     */
    public static String formatVector(float[] vector) {
        if (vector == null || vector.length == 0) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder(vector.length * 9 + 2);
        sb.append('[');
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(vector[i]);
        }
        sb.append(']');
        return sb.toString();
    }
}
