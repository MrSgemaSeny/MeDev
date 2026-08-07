package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class EducationRequest {
    @NotBlank
    private String institution;
    
    @NotBlank
    private String degree;
    
    private String field;
    
    @NotNull
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private Boolean isCurrent;
}
