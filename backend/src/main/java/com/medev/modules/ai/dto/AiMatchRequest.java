package com.medev.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiMatchRequest {

    @NotBlank(message = "Job description is required")
    @Size(max = 8000, message = "Job description must not exceed 8000 characters")
    private String jobDescription;
}
