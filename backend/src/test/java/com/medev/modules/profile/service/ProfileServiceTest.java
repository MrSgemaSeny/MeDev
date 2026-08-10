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

    @Test
    void addExperience_happyPath() {
        Profile profile = Profile.builder().id(10L).build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        ExperienceRequest request = new ExperienceRequest();
        request.setCompany("Acme");
        request.setPosition("Engineer");
        request.setDescription("Doing things");
        request.setTechStack("Java");
        request.setStartDate(LocalDate.of(2020, 1, 1));
        request.setIsCurrent(true);

        profileService.addExperience(1L, request);

        verify(experienceRepository).save(argThat(exp -> 
                exp.getProfile().getId().equals(10L) &&
                "Acme".equals(exp.getCompany()) &&
                "Engineer".equals(exp.getPosition()) &&
                exp.getIsCurrent()
        ));
    }

    @Test
    void updateExperience_happyPath() {
        Profile profile = Profile.builder().id(10L).build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        
        Experience exp = Experience.builder().id(100L).profile(profile).build();
        when(experienceRepository.findById(100L)).thenReturn(Optional.of(exp));

        ExperienceRequest request = new ExperienceRequest();
        request.setCompany("New Company");

        profileService.updateExperience(1L, 100L, request);

        verify(experienceRepository).save(exp);
        assertThat(exp.getCompany()).isEqualTo("New Company");
    }

    @Test
    void deleteExperience_happyPath() {
        Profile profile = Profile.builder().id(10L).build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        
        Experience exp = Experience.builder().id(100L).profile(profile).build();
        when(experienceRepository.findById(100L)).thenReturn(Optional.of(exp));

        profileService.deleteExperience(1L, 100L);

        verify(experienceRepository).delete(exp);
    }

    @Test
    void deleteExperience_otherUsersExperience_throwsForbidden() {
        Profile profile = Profile.builder().id(10L).build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        
        Profile otherProfile = Profile.builder().id(11L).build();
        Experience exp = Experience.builder().id(100L).profile(otherProfile).build();
        when(experienceRepository.findById(100L)).thenReturn(Optional.of(exp));

        assertThatThrownBy(() -> profileService.deleteExperience(1L, 100L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Access denied");
    }

    @Test
    void reorderExperience_happyPath() {
        Profile profile = Profile.builder().id(10L).build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        Experience exp1 = Experience.builder().id(100L).profile(profile).build();
        Experience exp2 = Experience.builder().id(101L).profile(profile).build();
        when(experienceRepository.findAllById(List.of(101L, 100L))).thenReturn(List.of(exp2, exp1));

        profileService.reorderExperience(1L, List.of(101L, 100L));

        verify(experienceRepository).updateSortOrder(101L, 0);
        verify(experienceRepository).updateSortOrder(100L, 1);
    }

    @Test
    void reorderExperience_foreignIds_throwsForbidden() {
        Profile profile = Profile.builder().id(10L).build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        Profile otherProfile = Profile.builder().id(11L).build();
        Experience exp1 = Experience.builder().id(100L).profile(otherProfile).build();
        when(experienceRepository.findAllById(List.of(100L))).thenReturn(List.of(exp1));

        assertThatThrownBy(() -> profileService.reorderExperience(1L, List.of(100L)))
                .isInstanceOf(ForbiddenException.class)
                .hasMessage("Access denied");
    }

    @Test
    void addSkill_happyPath() {
        Profile profile = Profile.builder().id(10L).build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        SkillRequest request = new SkillRequest();
        request.setName("Java");

        profileService.addSkill(1L, request);

        verify(skillRepository).save(any());
    }

    @Test
    void addProject_happyPath() {
        Profile profile = Profile.builder().id(10L).build();
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        ProjectRequest request = new ProjectRequest();
        request.setName("My Project");

        profileService.addProject(1L, request);

        verify(projectRepository).save(any());
    }
}
