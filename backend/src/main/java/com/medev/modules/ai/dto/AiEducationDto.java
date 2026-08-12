package com.medev.modules.ai.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AiEducationDto {
    private String institution;
    private String degree;
    private String fieldOfStudy;
    private LocalDate startDate;
    private LocalDate endDate;
}
