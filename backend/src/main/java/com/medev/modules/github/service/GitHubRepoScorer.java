package com.medev.modules.github.service;

import com.medev.modules.github.dto.GitHubRepoDto;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class GitHubRepoScorer {

    private static final double WEIGHT_STARS    = 0.35;
    private static final double WEIGHT_RECENCY  = 0.30;
    private static final double WEIGHT_SIZE     = 0.20;
    private static final double WEIGHT_FORKS    = 0.15;

    private static final int    MAX_STARS     = 100;     // 100+ звезд = максимум по звездам
    private static final int    MAX_FORKS     = 30;      // 30+ форков = максимум по форкам
    private static final int    MAX_SIZE_KB   = 200_000; // нормализация по 200MB
    private static final int    MAX_AGE_DAYS  = 730;     // 2 года = 0 баллов по recency

    public static int calculateScore(GitHubRepoDto repo) {
        if (repo == null) return 0;
        
        if (repo.isFork() || repo.isArchived()) {
            return 0;
        }

        double starScore = 0;
        if (repo.getStargazersCount() != null && repo.getStargazersCount() > 0) {
            starScore = Math.min((double) repo.getStargazersCount() / MAX_STARS, 1.0);
        }

        double forkScore = 0;
        if (repo.getForksCount() != null && repo.getForksCount() > 0) {
            forkScore = Math.min((double) repo.getForksCount() / MAX_FORKS, 1.0);
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

        double total = (starScore * WEIGHT_STARS)
                + (recencyScore * WEIGHT_RECENCY)
                + (sizeScore * WEIGHT_SIZE)
                + (forkScore * WEIGHT_FORKS);

        return (int) Math.round(total * 1000);
    }
}
