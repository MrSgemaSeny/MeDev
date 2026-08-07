package com.medev.modules.profile.dto;

import lombok.Data;

@Data
public class SkillDto {
    private Long id;
    private String name;
    private String category;
    private String level;
    private Integer sortOrder;
}
