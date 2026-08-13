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
    void calculateScore_WithStarsAndForks_CalculatesCorrectly() {
        GitHubRepoDto repo = new GitHubRepoDto();
        repo.setStargazersCount(10); // 10 * 10 = 100
        repo.setForksCount(5);       // 5 * 5 = 25
        
        assertEquals(125, GitHubRepoScorer.calculateScore(repo));
    }

    @Test
    void calculateScore_WithSize_CapsAt50() {
        GitHubRepoDto repo1 = new GitHubRepoDto();
        repo1.setSize(200); // 200 / 100 = 2
        assertEquals(2, GitHubRepoScorer.calculateScore(repo1));

        GitHubRepoDto repo2 = new GitHubRepoDto();
        repo2.setSize(10000); // 10000 / 100 = 100, capped at 50
        assertEquals(50, GitHubRepoScorer.calculateScore(repo2));
    }

    @Test
    void calculateScore_WithDescriptionAndLanguage_AddsBonus() {
        GitHubRepoDto repo = new GitHubRepoDto();
        repo.setDescription("A cool project"); // +5
        repo.setLanguage("Java");              // +5
        
        assertEquals(10, GitHubRepoScorer.calculateScore(repo));
    }

    @Test
    void calculateScore_WithRecentUpdate_AddsBonus() {
        GitHubRepoDto repoRecent = new GitHubRepoDto();
        repoRecent.setUpdatedAt(Instant.now().minus(10, ChronoUnit.DAYS).toString()); // < 90 days -> +20
        assertEquals(20, GitHubRepoScorer.calculateScore(repoRecent));

        GitHubRepoDto repoOld = new GitHubRepoDto();
        repoOld.setUpdatedAt(Instant.now().minus(200, ChronoUnit.DAYS).toString()); // < 365 days -> +10
        assertEquals(10, GitHubRepoScorer.calculateScore(repoOld));
        
        GitHubRepoDto repoVeryOld = new GitHubRepoDto();
        repoVeryOld.setUpdatedAt(Instant.now().minus(400, ChronoUnit.DAYS).toString()); // > 365 days -> 0
        assertEquals(0, GitHubRepoScorer.calculateScore(repoVeryOld));
    }

    @Test
    void calculateScore_Sorting_WorksAsExpected() {
        GitHubRepoDto betterRepo = new GitHubRepoDto();
        betterRepo.setStargazersCount(50);
        betterRepo.setLanguage("Java");
        betterRepo.setUpdatedAt(Instant.now().toString());

        GitHubRepoDto worseRepo = new GitHubRepoDto();
        worseRepo.setStargazersCount(2);
        
        int betterScore = GitHubRepoScorer.calculateScore(betterRepo);
        int worseScore = GitHubRepoScorer.calculateScore(worseRepo);
        
        assertTrue(betterScore > worseScore);
    }
}
