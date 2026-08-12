package com.medev.modules.github.dto;

import java.time.LocalDate;

public record GitHubStatsDto(
    int totalCommits,
    int totalRepositoriesContributed,
    int totalContributions,
    LocalDate from,
    LocalDate to
) {}
