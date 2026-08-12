package com.medev.modules.ai.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiProjectDto {
    private String name;
    private String description;
    private String githubUrl;
    private String techStack;
}
