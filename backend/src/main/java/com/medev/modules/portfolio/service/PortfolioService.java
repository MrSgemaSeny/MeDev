package com.medev.modules.portfolio.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.portfolio.dto.PublicProfileDto;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.repository.ProfileRepository;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final com.medev.modules.portfolio.dto.PortfolioMapper portfolioMapper;

    @Transactional(readOnly = true)
    @Cacheable(value = "public-profiles", key = "#username.toLowerCase()")
    public PublicProfileDto getPublicProfile(String username) {
        User user = userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Profile not found"));

        if (profile.getIsPublic() == null || !profile.getIsPublic()) {
            throw new NotFoundException("Profile not found");
        }

        PublicProfileDto dto = portfolioMapper.toDto(profile, user);
        if (dto.getProjects() != null) {
            dto.setProjects(dto.getProjects().stream()
                    .filter(p -> Boolean.TRUE.equals(p.getIsVisible()))
                    .collect(java.util.stream.Collectors.toList()));
        }
        return dto;
    }
}
