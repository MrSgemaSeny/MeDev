package com.medev.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiApplicationRequest {
    @NotBlank(message = "Job description is required")
    @jakarta.validation.constraints.Size(max = 8000, message = "Job description must not exceed 8000 characters")
    private String jobDescription;
    
    @jakarta.validation.constraints.Size(max = 200, message = "Target role must not exceed 200 characters")
    private String targetRole;
}
