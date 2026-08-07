package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank
    private String name;
    
    private String description;
    private String techStack;
    private String githubUrl;
    private String liveUrl;
    private Boolean isFeatured;
    private Boolean isVisible;
}
