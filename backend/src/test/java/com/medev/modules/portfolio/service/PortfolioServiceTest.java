package com.medev.modules.portfolio.service;

import com.medev.shared.exception.NotFoundException;
import com.medev.modules.portfolio.dto.PublicProfileDto;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.repository.ProfileRepository;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private com.medev.modules.portfolio.dto.PortfolioMapper portfolioMapper;

    @InjectMocks
    private PortfolioService portfolioService;

    @Test
    void getPublicProfile_happyPath() {
        User user = User.builder().id(1L).username("johndoe").build();
        Profile profile = Profile.builder().id(10L).user(user).isPublic(true).fullName("John Doe").build();

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(portfolioMapper.toDto(profile, user)).thenReturn(PublicProfileDto.builder().build());

        PublicProfileDto result = portfolioService.getPublicProfile("johndoe");

        assertThat(result).isNotNull();
    }

    @Test
    void getPublicProfile_usernameNotFound_throwsNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> portfolioService.getPublicProfile("unknown"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Profile not found");
    }

    @Test
    void getPublicProfile_profileNotFound_throwsNotFound() {
        User user = User.builder().id(1L).username("johndoe").build();
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> portfolioService.getPublicProfile("johndoe"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Profile not found");
    }

    @Test
    void getPublicProfile_privateProfile_throwsNotFound() {
        User user = User.builder().id(1L).username("johndoe").build();
        Profile profile = Profile.builder().id(10L).user(user).isPublic(false).build();

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(user));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        assertThatThrownBy(() -> portfolioService.getPublicProfile("johndoe"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Profile not found");
    }
}
