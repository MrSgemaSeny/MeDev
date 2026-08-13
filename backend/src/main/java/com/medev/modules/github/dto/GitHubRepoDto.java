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

    private Integer size;

    @JsonProperty("updated_at")
    private String updatedAt;
    
    @JsonProperty("fork")
    private Boolean fork;
    
    @JsonProperty("archived")
    private Boolean archived;
    
    public boolean isFork() { return Boolean.TRUE.equals(fork); }
    public boolean isArchived() { return Boolean.TRUE.equals(archived); }
}
