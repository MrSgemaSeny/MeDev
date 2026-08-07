package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LanguageRequest {
    @NotBlank
    private String name;
    
    private String level;
}
