package com.medev.modules.github.service;

import com.medev.modules.github.dto.GitHubRepoDto;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class GitHubRepoScorer {

    /**
     * Calculates a quality score for a GitHub repository.
     * Higher score means the repository is more significant (e.g. more stars, recently updated, larger size).
     */
    public static int calculateScore(GitHubRepoDto repo) {
        if (repo == null) return 0;

        int score = 0;

        if (repo.getStargazersCount() != null) {
            score += repo.getStargazersCount() * 10;
        }

        if (repo.getForksCount() != null) {
            score += repo.getForksCount() * 5;
        }

        if (repo.getSize() != null) {
            // size is in KB. 1 point for every 100KB. Cap at 50 points (5MB).
            int sizeScore = Math.min(repo.getSize() / 100, 50);
            score += sizeScore;
        }

        if (repo.getDescription() != null && !repo.getDescription().isBlank()) {
            score += 5;
        }

        if (repo.getLanguage() != null && !repo.getLanguage().isBlank()) {
            score += 5;
        }

        if (repo.getUpdatedAt() != null) {
            try {
                Instant updatedAt = Instant.parse(repo.getUpdatedAt());
                long daysAgo = ChronoUnit.DAYS.between(updatedAt, Instant.now());
                if (daysAgo <= 90) { // 3 months
                    score += 20;
                } else if (daysAgo <= 365) { // 1 year
                    score += 10;
                }
            } catch (Exception e) {
                // Ignore parse errors
            }
        }

        return score;
    }
}
