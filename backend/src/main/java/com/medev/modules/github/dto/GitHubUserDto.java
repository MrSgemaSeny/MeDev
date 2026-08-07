package com.medev.modules.github.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GitHubUserDto {
    private String login;
    private String name;
    
    @JsonProperty("avatar_url")
    private String avatarUrl;
    
    private String bio;
    private String location;
    
    @JsonProperty("public_repos")
    private Integer publicRepos;
}
