package com.medev.modules.github.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitHubRepoDto {
    private Long id;
    private String name;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("private")
    private Boolean isPrivate;
    
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
    
    @JsonProperty("created_at")
    private String createdAt;
    
    @JsonProperty("fork")
    private Boolean fork;
    
    @JsonProperty("archived")
    private Boolean archived;
    
    public boolean isFork() { return Boolean.TRUE.equals(fork); }
    public boolean isArchived() { return Boolean.TRUE.equals(archived); }
    public boolean isPrivate() { return Boolean.TRUE.equals(isPrivate); }

    public String getRepoPath(String defaultOwner) {
        if (fullName != null && !fullName.isBlank()) {
            return fullName;
        }
        if (defaultOwner != null && !defaultOwner.isBlank() && name != null && !name.isBlank()) {
            return defaultOwner + "/" + name;
        }
        return name != null ? name : "";
    }
}

