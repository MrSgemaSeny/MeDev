package com.medev.modules.profile.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.entity.*;
import com.medev.modules.profile.repository.*;
import com.medev.modules.ai.dto.*;
import com.medev.shared.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock private ProfileRepository profileRepository;
    @Mock private ExperienceRepository experienceRepository;
    @Mock private EducationRepository educationRepository;
    @Mock private SkillRepository skillRepository;
    @Mock private LanguageRepository languageRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private ProfileMapper profileMapper;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private ProfileService profileService;

    private User user;
    private Profile profile;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).build();
        profile = Profile.builder().id(10L).user(user).build();
    }

    @Test
    void createEmptyProfile_savesProfile() {
        profileService.createEmptyProfile(user);
        verify(profileRepository).save(argThat(p -> p.getUser().getId().equals(1L) && p.getIsPublic()));
    }

    @Test
    void setGithubUsernameIfMissing_whenMissing_setsUsername() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        profileService.setGithubUsernameIfMissing(1L, "newuser");
        verify(profileRepository).save(profile);
        assertThat(profile.getGithubUsername()).isEqualTo("newuser");
    }

    @Test
    void setGithubUsernameIfMissing_whenExists_doesNothing() {
        profile.setGithubUsername("existing");
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        profileService.setGithubUsernameIfMissing(1L, "newuser");
        verify(profileRepository, never()).save(any());
    }

    @Test
    void setAvatarIfMissing_whenMissing_setsAvatar() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        profileService.setAvatarIfMissing(1L, "url");
        verify(profileRepository).save(profile);
        assertThat(profile.getAvatarUrl()).isEqualTo("url");
    }

    @Test
    void getByUserId_happyPath() {
        profile.setFullName("John Doe");
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(profileMapper.toDto(profile)).thenReturn(new ProfileDto());

        ProfileDto result = profileService.getByUserId(1L);
        assertThat(result).isNotNull();
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
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Jane Doe");
        request.setHeadline("Dev");
        request.setSummary("Summary");

        profileService.update(1L, request);

        verify(profileRepository).save(profile);
        verify(eventPublisher).publishEvent(any());
        assertThat(profile.getFullName()).isEqualTo("Jane Doe");
        assertThat(profile.getHeadline()).isEqualTo("Dev");
    }

    @Test
    void updateSectionOrder_updatesOrder() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        profileService.updateSectionOrder(1L, List.of("skills", "experience"));
        verify(profileRepository).save(profile);
        assertThat(profile.getSectionOrder()).containsExactly("skills", "experience");
    }

    @Test
    void importParsedResume_mergesFieldsAndSaves() {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));

        AiParsedResumeDto parsed = new AiParsedResumeDto();
        parsed.setFullName("Parsed Name");
        
        AiSkillDto skillDto = new AiSkillDto();
        skillDto.setName("Java");
        parsed.setSkills(List.of(skillDto));

        profileService.importParsedResume(1L, parsed);

        verify(profileRepository).saveAndFlush(profile);
        verify(skillRepository, times(1)).save(any(Skill.class));
        verify(eventPublisher).publishEvent(any());
        assertThat(profile.getFullName()).isEqualTo("Parsed Name");
    }

    @Test
    void updateFromGitHub_mergesData() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        com.medev.modules.github.dto.GitHubProfileDto github = com.medev.modules.github.dto.GitHubProfileDto.builder()
                .name("Git Name")
                .username("gituser")
                .build();

        profileService.updateFromGitHub(1L, github);

        verify(profileRepository).save(profile);
        assertThat(profile.getFullName()).isEqualTo("Git Name");
        assertThat(profile.getGithubUsername()).isEqualTo("gituser");
    }

    @Test
    void importProjects_addsNewProjects() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(projectRepository.findByProfileIdOrderBySortOrderAsc(10L)).thenReturn(new java.util.ArrayList<>());

        com.medev.modules.github.dto.GitHubRepoDto repo = new com.medev.modules.github.dto.GitHubRepoDto();
        repo.setName("Repo1");
        repo.setHtmlUrl("http://github.com/repo1");

        profileService.importProjects(1L, List.of(repo));

        verify(projectRepository, times(1)).save(any(Project.class));
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    void addSkillIfNotExists_addsSkill() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(skillRepository.findByProfileIdOrderBySortOrderAsc(10L)).thenReturn(List.of());

        profileService.addSkillIfNotExists(1L, "Java", "Backend");

        verify(skillRepository).save(argThat(s -> s.getName().equals("Java") && s.getCategory().equals("Backend")));
    }
}
