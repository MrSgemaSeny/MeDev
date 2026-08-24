package com.medev.modules.tracker.dto;

import com.medev.modules.tracker.entity.ApplicationStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateJobApplicationRequest {
    @jakarta.validation.constraints.Size(max = 200)
    private String companyName;
    @jakarta.validation.constraints.Size(max = 200)
    private String role;
    private ApplicationStatus status;
    @jakarta.validation.constraints.Size(max = 1000)
    private String jobUrl;
    @jakarta.validation.constraints.Size(max = 200)
    private String location;
    @jakarta.validation.constraints.Size(max = 100)
    private String salaryRange;
    @jakarta.validation.constraints.Size(max = 5000)
    private String notes;
    @jakarta.validation.constraints.Size(max = 20000)
    private String jobDescription;
    private Integer matchScore;
    @jakarta.validation.constraints.Size(max = 2000)
    private String matchFeedback;
    private LocalDate appliedDate;
}
