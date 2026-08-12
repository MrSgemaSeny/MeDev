package com.medev.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiApplicationRequest {
    @NotBlank(message = "Job description is required")
    private String jobDescription;
    
    private String targetRole;
}
