package com.medev.modules.profile.dto;

import com.medev.modules.profile.entity.*;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ExperienceDto toDto(Experience entity);
    EducationDto toDto(Education entity);
    SkillDto toDto(Skill entity);
    LanguageDto toDto(Language entity);
    ProjectDto toDto(Project entity);
}
