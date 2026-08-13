package com.medev.modules.github.service;

import com.medev.modules.github.dto.GitHubRepoDto;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class GitHubRepoScorer {

    private static final double WEIGHT_SIZE   = 0.6;
    private static final double WEIGHT_RECENCY = 0.4;
    private static final int    MAX_SIZE_KB   = 500_000; // нормализация по 500MB
    private static final int    MAX_AGE_DAYS  = 730;     // 2 года = 0 баллов по recency

    public static int calculateScore(GitHubRepoDto repo) {
        if (repo == null) return 0;
        
        if (repo.isFork() || repo.isArchived()) {
            return 0;
        }

        double sizeScore = 0;
        if (repo.getSize() != null && repo.getSize() > 0) {
            sizeScore = Math.min((double) repo.getSize() / MAX_SIZE_KB, 1.0);
        }

        double recencyScore = 0;
        if (repo.getUpdatedAt() != null) {
            try {
                Instant updated = Instant.parse(repo.getUpdatedAt());
                long daysAgo = ChronoUnit.DAYS.between(updated, Instant.now());
                recencyScore = Math.max(0, 1.0 - (double) daysAgo / MAX_AGE_DAYS);
            } catch (Exception ignored) {}
        }

        return (int) ((sizeScore * WEIGHT_SIZE + recencyScore * WEIGHT_RECENCY) * 1000);
    }
}
