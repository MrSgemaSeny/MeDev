package com.medev.modules.profile.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ExperienceDto {
    private Long id;
    private String company;
    private String position;
    private String description;
    private String techStack;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent;
    private Integer sortOrder;
}
