package com.medev.modules.profile.dto;

import lombok.Data;

@Data
public class ProfileDto {
    private Long id;
    private String fullName;
    private String headline;
    private String summary;
    private String avatarUrl;
    private String location;
    private String website;
    private String githubUsername;
    private String telegram;
    private String linkedin;
    private java.util.List<ExperienceDto> experience;
    private java.util.List<EducationDto> education;
    private java.util.List<SkillDto> skills;
    private java.util.List<LanguageDto> languages;
    private java.util.List<ProjectDto> projects;
}
