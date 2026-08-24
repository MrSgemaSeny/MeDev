package com.medev.modules.profile.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    @jakarta.validation.constraints.Size(max = 100)
    private String fullName;
    @jakarta.validation.constraints.Size(max = 200)
    private String headline;
    @jakarta.validation.constraints.Size(max = 2000)
    private String summary;
    @jakarta.validation.constraints.Size(max = 500)
    private String avatarUrl;
    @jakarta.validation.constraints.Size(max = 100)
    private String location;
    @jakarta.validation.constraints.Size(max = 200)
    private String website;
    @jakarta.validation.constraints.Size(max = 100)
    private String githubUsername;
    @jakarta.validation.constraints.Size(max = 100)
    private String telegram;
    @jakarta.validation.constraints.Size(max = 200)
    private String linkedin;
}
