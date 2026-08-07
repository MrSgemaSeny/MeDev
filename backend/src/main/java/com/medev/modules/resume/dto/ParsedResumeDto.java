package com.medev.modules.resume.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ParsedResumeDto {
    private String rawText;
    private String name;
    private String email;
    private String phone;
    private List<String> skills;
}
