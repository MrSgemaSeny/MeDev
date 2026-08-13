package com.medev.modules.portfolio.dto;

import com.medev.modules.auth.entity.User;
import com.medev.modules.profile.entity.Profile;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicProfileDto {
    private String username;
    private String fullName;
    private String headline;
    private String summary;
    private String avatarUrl;
    private String location;
    private String website;
    private String githubUsername;
    private String telegram;
    private String linkedin;
    
    private java.util.List<com.medev.modules.profile.dto.ExperienceDto> experience;
    private java.util.List<com.medev.modules.profile.dto.EducationDto> education;
    private java.util.List<com.medev.modules.profile.dto.SkillDto> skills;
    private java.util.List<com.medev.modules.profile.dto.LanguageDto> languages;
    private java.util.List<com.medev.modules.profile.dto.ProjectDto> projects;
    private java.util.List<String> sectionOrder;
}
