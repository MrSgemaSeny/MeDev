package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank
    @jakarta.validation.constraints.Size(max = 100)
    private String name;
    
    @jakarta.validation.constraints.Size(max = 2000)
    private String description;
    @jakarta.validation.constraints.Size(max = 500)
    private String techStack;
    @jakarta.validation.constraints.Size(max = 300)
    @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://)[^\\s<>\"]+$", message = "GitHub URL must be a valid HTTP or HTTPS URL")
    private String githubUrl;
    @jakarta.validation.constraints.Size(max = 300)
    @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://)[^\\s<>\"]+$", message = "Live URL must be a valid HTTP or HTTPS URL")
    private String liveUrl;
    private Boolean isFeatured;
    private Boolean isVisible;
}
