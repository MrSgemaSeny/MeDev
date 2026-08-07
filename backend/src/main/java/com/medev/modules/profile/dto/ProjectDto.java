package com.medev.modules.profile.dto;

import lombok.Data;

@Data
public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private String techStack;
    private String githubUrl;
    private String liveUrl;
    private Integer stars;
    private Boolean isFeatured;
    private Boolean isVisible;
    private Integer sortOrder;
}
