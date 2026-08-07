package com.medev.modules.github.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GitHubRepoDto {
    private Long id;
    private String name;
    
    @JsonProperty("html_url")
    private String htmlUrl;
    
    private String description;
    private String language;
    
    @JsonProperty("stargazers_count")
    private Integer stargazersCount;
    
    @JsonProperty("forks_count")
    private Integer forksCount;
}
