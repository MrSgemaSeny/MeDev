package com.medev.modules.tracker.dto;

import com.medev.modules.tracker.entity.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class JobApplicationDto {
    private Long id;
    private String companyName;
    private String role;
    private ApplicationStatus status;
    private String jobUrl;
    private String location;
    private String salaryRange;
    private String notes;
    private String jobDescription;
    private Integer matchScore;
    private String matchFeedback;
    private LocalDate appliedDate;
    private OffsetDateTime updatedAt;
}
