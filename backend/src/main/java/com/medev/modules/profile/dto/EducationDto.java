package com.medev.modules.profile.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EducationDto {
    private Long id;
    private String institution;
    private String degree;
    private String field;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent;
    private Integer sortOrder;
}
