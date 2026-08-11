package com.medev.modules.ai.dto;

import lombok.Data;

@Data
public class EvaluationRequest {
    private String endpoint;
    private Boolean isPositive;
    private String generatedText;
    private String notes;
}
