package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SkillRequest {
    @NotBlank
    private String name;
    
    private String category;
    
    private String level;
}
