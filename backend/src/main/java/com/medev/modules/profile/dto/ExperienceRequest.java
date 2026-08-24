package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ExperienceRequest {
    @NotBlank @jakarta.validation.constraints.Size(max = 100) private String company;
    @NotBlank @jakarta.validation.constraints.Size(max = 100) private String position;
    @jakarta.validation.constraints.Size(max = 3000) private String description;
    @jakarta.validation.constraints.Size(max = 500) private String techStack;
    @NotNull private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent = false;
}
