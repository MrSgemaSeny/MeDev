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

    public static PublicProfileDto fromProfile(Profile profile, User user) {
        return PublicProfileDto.builder()
                .username(user.getUsername())
                .fullName(profile.getFullName())
                .headline(profile.getHeadline())
                .summary(profile.getSummary())
                .avatarUrl(profile.getAvatarUrl())
                .location(profile.getLocation())
                .website(profile.getWebsite())
                .githubUsername(profile.getGithubUsername())
                .telegram(profile.getTelegram())
                .linkedin(profile.getLinkedin())
                // In the future, add experiences, skills, projects
                .build();
    }
}
