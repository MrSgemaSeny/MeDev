package com.medev.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiOnboardingRequest {
    @NotBlank(message = "Role is required")
    private String role;
    
    @NotBlank(message = "Stack is required")
    private String stack;
    
    @NotBlank(message = "Recent experience is required")
    private String recentExperience;
}
