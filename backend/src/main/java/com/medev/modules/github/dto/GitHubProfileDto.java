package com.medev.modules.github.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class GitHubProfileDto {
    private String username;
    private String name;
    private String avatarUrl;
    private String bio;
    private String location;
    private Integer publicRepos;
    private List<GitHubRepoDto> repos;
    private Map<String, Integer> languageStats;
}
