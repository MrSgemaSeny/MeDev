package com.medev.modules.ai.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiLanguageDto {
    private String name;
    private String proficiency;
}
