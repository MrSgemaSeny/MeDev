package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ExperienceRequest {
    @NotBlank private String company;
    @NotBlank private String position;
    private String description;
    private String techStack;
    @NotNull private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent = false;
}
