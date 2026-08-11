package com.medev.modules.ai.dto;

import lombok.Data;

@Data
public class GenerateRequest {
    private String language;
    private String projectName;
}
