package com.medev.modules.tracker.dto;

import com.medev.modules.tracker.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateJobApplicationRequest {
    @NotBlank
    private String companyName;
    
    @NotBlank
    private String role;
    
    @NotNull
    private ApplicationStatus status;
    
    private String jobUrl;
    private String location;
    private String salaryRange;
    private String notes;
    private LocalDate appliedDate;
}
