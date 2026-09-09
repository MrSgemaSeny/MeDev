package com.medev.modules.github.service;

import com.medev.modules.github.dto.GitHubRepoDto;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

class GitHubRepoScorerTest {

    @Test
    void calculateScore_NullRepo_ReturnsZero() {
        assertEquals(0, GitHubRepoScorer.calculateScore(null));
    }

    @Test
    void calculateScore_EmptyRepo_ReturnsZero() {
        GitHubRepoDto repo = new GitHubRepoDto();
        assertEquals(0, GitHubRepoScorer.calculateScore(repo));
    }

    @Test
    void calculateScore_ForkOrArchived_ReturnsZero() {
        GitHubRepoDto repo1 = new GitHubRepoDto();
        repo1.setFork(true);
        repo1.setSize(100000);
        assertEquals(0, GitHubRepoScorer.calculateScore(repo1));

        GitHubRepoDto repo2 = new GitHubRepoDto();
        repo2.setArchived(true);
        repo2.setSize(100000);
        assertEquals(0, GitHubRepoScorer.calculateScore(repo2));
    }

    @Test
    void calculateScore_WithSize_CalculatesCorrectly() {
        GitHubRepoDto repo1 = new GitHubRepoDto();
        repo1.setSize(100_000); // 0.5 * 0.20 = 0.10 * 1000 = 100
        assertEquals(100, GitHubRepoScorer.calculateScore(repo1));

        GitHubRepoDto repo2 = new GitHubRepoDto();
        repo2.setSize(300_000); // 1.0 (capped) * 0.20 = 0.20 * 1000 = 200
        assertEquals(200, GitHubRepoScorer.calculateScore(repo2));
    }

    @Test
    void calculateScore_WithRecency_CalculatesCorrectly() {
        GitHubRepoDto repoRecent = new GitHubRepoDto();
        repoRecent.setUpdatedAt(Instant.now().toString()); // daysAgo = 0 -> 1.0 * 0.30 = 0.30 * 1000 = 300
        assertEquals(300, GitHubRepoScorer.calculateScore(repoRecent));

        GitHubRepoDto repoOld = new GitHubRepoDto();
        repoOld.setUpdatedAt(Instant.now().minus(365, ChronoUnit.DAYS).toString()); // daysAgo = 365/730 = 0.5 * 0.30 = 0.15 * 1000 = 150
        assertEquals(150, GitHubRepoScorer.calculateScore(repoOld));
        
        GitHubRepoDto repoVeryOld = new GitHubRepoDto();
        repoVeryOld.setUpdatedAt(Instant.now().minus(800, ChronoUnit.DAYS).toString()); // daysAgo = 800 -> 0 * 0.30 = 0
        assertEquals(0, GitHubRepoScorer.calculateScore(repoVeryOld));
    }

    @Test
    void calculateScore_Mixed_CalculatesCorrectly() {
        GitHubRepoDto repo = new GitHubRepoDto();
        repo.setStargazersCount(100); // 1.0 * 0.35 = 0.35
        repo.setForksCount(30);       // 1.0 * 0.15 = 0.15
        repo.setSize(200_000);        // 1.0 * 0.20 = 0.20
        repo.setUpdatedAt(Instant.now().toString()); // 1.0 * 0.30 = 0.30
        // total = 1.0 * 1000 = 1000
        assertEquals(1000, GitHubRepoScorer.calculateScore(repo));
    }
}
