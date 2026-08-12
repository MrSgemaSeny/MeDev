package com.medev.modules.profile.service;

import com.medev.shared.exception.ForbiddenException;
import com.medev.shared.exception.NotFoundException;
import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.entity.Experience;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.repository.*;
import com.medev.modules.auth.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private ExperienceRepository experienceRepository;
    @Mock
    private EducationRepository educationRepository;
    @Mock
    private SkillRepository skillRepository;
    @Mock
    private LanguageRepository languageRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ProfileMapper profileMapper;
    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ProfileService profileService;

    @Test
    void createEmptyProfile_savesProfile() {
        User user = User.builder().id(1L).build();

        profileService.createEmptyProfile(user);

        verify(profileRepository).save(argThat(profile -> 
                profile.getUser().getId().equals(1L) && profile.getIsPublic()
        ));
    }

    @Test
    void getByUserId_happyPath() {
        User user = User.builder().id(1L).build();
        Profile profile = Profile.builder().id(10L).user(user).fullName("John Doe").build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(profileMapper.toDto(profile)).thenReturn(new ProfileDto());

        ProfileDto result = profileService.getByUserId(1L);

        assertThat(result).isNotNull();
        // Assuming mapping works, but we are just unit testing the flow here.
    }

    @Test
    void getByUserId_notFound_throwsNotFoundException() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> profileService.getByUserId(1L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Profile not found");
    }

    @Test
    void update_updatesAllFields() {
        Profile profile = Profile.builder().id(10L).build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Jane Doe");
        request.setHeadline("Dev");
        request.setSummary("Summary");

        profileService.update(1L, request);

        verify(profileRepository).save(profile);
        assertThat(profile.getFullName()).isEqualTo("Jane Doe");
        assertThat(profile.getHeadline()).isEqualTo("Dev");
        assertThat(profile.getSummary()).isEqualTo("Summary");
    }
}
