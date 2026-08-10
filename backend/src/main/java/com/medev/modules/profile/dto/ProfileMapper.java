package com.medev.modules.profile.dto;

import com.medev.modules.profile.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProfileMapper {

    @Mapping(source = "experiences", target = "experience")
    @Mapping(source = "educations", target = "education")
    ProfileDto toDto(Profile profile);

    ExperienceDto toDto(Experience entity);
    EducationDto toDto(Education entity);
    SkillDto toDto(Skill entity);
    LanguageDto toDto(Language entity);
    ProjectDto toDto(Project entity);
}
