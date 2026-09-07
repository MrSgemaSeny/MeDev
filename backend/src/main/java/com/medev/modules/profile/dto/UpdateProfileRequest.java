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
    @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://)[^\\s<>\"]+$", message = "Avatar URL must start with http:// or https://")
    private String avatarUrl;
    @jakarta.validation.constraints.Size(max = 100)
    private String location;
    @jakarta.validation.constraints.Size(max = 200)
    @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://|mailto:)[^\\s<>\"]+$", message = "Website must be a valid HTTP, HTTPS, or mailto URL")
    private String website;
    @jakarta.validation.constraints.Size(max = 100)
    @jakarta.validation.constraints.Pattern(regexp = "^$|^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$", message = "Invalid GitHub username format")
    private String githubUsername;
    @jakarta.validation.constraints.Size(max = 100)
    @jakarta.validation.constraints.Pattern(regexp = "^$|^@?[a-zA-Z0-9_]{3,32}$", message = "Invalid Telegram username format")
    private String telegram;
    @jakarta.validation.constraints.Size(max = 200)
    @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://)[^\\s<>\"]+$", message = "LinkedIn must be a valid HTTP or HTTPS URL")
    private String linkedin;
}
