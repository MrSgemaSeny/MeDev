package com.medev.modules.profile.dto;

import lombok.Data;

@Data
public class LanguageDto {
    private Long id;
    private String name;
    private String level;
    private Integer sortOrder;
}
