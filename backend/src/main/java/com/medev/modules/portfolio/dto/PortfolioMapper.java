package com.medev.modules.portfolio.dto;

import com.medev.modules.auth.entity.User;
import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.entity.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProfileMapper.class})
public interface PortfolioMapper {

    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "profile.experiences", target = "experience")
    @Mapping(source = "profile.educations", target = "education")
    PublicProfileDto toDto(Profile profile, User user);
}
