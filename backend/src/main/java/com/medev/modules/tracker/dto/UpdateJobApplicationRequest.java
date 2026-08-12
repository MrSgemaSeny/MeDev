package com.medev.modules.tracker.dto;

import com.medev.modules.tracker.entity.ApplicationStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateJobApplicationRequest {
    private String companyName;
    private String role;
    private ApplicationStatus status;
    private String jobUrl;
    private String location;
    private String salaryRange;
    private String notes;
    private LocalDate appliedDate;
}
