package com.medev.modules.ai.dto;

import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiExperienceDto {
    private String company;
    private String position;
    private String description;
    private String techStack;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent;
}
