package com.medev.modules.ai.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiParsedResumeDto {
    private String fullName;
    private String headline;
    private String summary;
    private String location;
    private String website;
    private String githubUsername;
    private String telegram;
    private String linkedin;

    private List<AiSkillDto> skills;
    private List<AiLanguageDto> languages;
    private List<AiExperienceDto> experience;
    private List<AiEducationDto> education;
}
