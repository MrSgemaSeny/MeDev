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
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));
        profileService.setGithubUsernameIfMissing(1L, "newuser");
        verify(profileRepository).findByUserIdForUpdate(1L);
        verify(profileRepository).save(profile);
        assertThat(profile.getGithubUsername()).isEqualTo("newuser");
    }

    @Test
    void setGithubUsernameIfMissing_whenExists_doesNothing() {
        profile.setGithubUsername("existing");
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));
        profileService.setGithubUsernameIfMissing(1L, "newuser");
        verify(profileRepository).findByUserIdForUpdate(1L);
        verify(profileRepository, never()).save(any());
    }

    @Test
    void setAvatarIfMissing_whenMissing_setsAvatar() {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));
        profileService.setAvatarIfMissing(1L, "url");
        verify(profileRepository).findByUserIdForUpdate(1L);
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
    void update_updatesAllFieldsWithPessimisticLock() {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Jane Doe");
        request.setHeadline("Dev");
        request.setSummary("Summary");

        profileService.update(1L, request);

        verify(profileRepository).findByUserIdForUpdate(1L);
        verify(profileRepository).save(profile);
        verify(eventPublisher).publishEvent(any());
        assertThat(profile.getFullName()).isEqualTo("Jane Doe");
        assertThat(profile.getHeadline()).isEqualTo("Dev");
    }

    @Test
    void updateSectionOrder_updatesOrderWithPessimisticLock() {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));
        profileService.updateSectionOrder(1L, List.of("skills", "experience"));
        verify(profileRepository).findByUserIdForUpdate(1L);
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

        verify(profileRepository).findByUserIdForUpdate(1L);
        verify(profileRepository).saveAndFlush(profile);
        verify(skillRepository, times(1)).save(any(Skill.class));
        verify(eventPublisher).publishEvent(any());
        assertThat(profile.getFullName()).isEqualTo("Parsed Name");
    }

    @Test
    void updateFromGitHub_mergesDataWithPessimisticLock() {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));

        com.medev.modules.github.dto.GitHubProfileDto github = com.medev.modules.github.dto.GitHubProfileDto.builder()
                .name("Git Name")
                .username("gituser")
                .build();

        profileService.updateFromGitHub(1L, github);

        verify(profileRepository).findByUserIdForUpdate(1L);
        verify(profileRepository).save(profile);
        assertThat(profile.getFullName()).isEqualTo("Git Name");
        assertThat(profile.getGithubUsername()).isEqualTo("gituser");
    }

    @Test
    void importProjects_addsNewProjectsWithPessimisticLock() {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));
        when(projectRepository.findByProfileIdOrderBySortOrderAsc(10L)).thenReturn(new java.util.ArrayList<>());

        com.medev.modules.github.dto.GitHubRepoDto repo = new com.medev.modules.github.dto.GitHubRepoDto();
        repo.setName("Repo1");
        repo.setHtmlUrl("http://github.com/repo1");

        profileService.importProjects(1L, List.of(repo));

        verify(profileRepository).findByUserIdForUpdate(1L);
        verify(projectRepository, times(1)).save(any(Project.class));
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    void addSkillIfNotExists_addsSkillWithPessimisticLock() {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));
        when(skillRepository.findByProfileIdOrderBySortOrderAsc(10L)).thenReturn(List.of());

        profileService.addSkillIfNotExists(1L, "Java", "Backend");

        verify(profileRepository).findByUserIdForUpdate(1L);
        verify(skillRepository).save(argThat(s -> s.getName().equals("Java") && s.getCategory().equals("Backend")));
    }

    @Test
    void importOrganizationsAsExperience_withPessimisticLock() {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));
        when(experienceRepository.findByProfileIdOrderBySortOrderAsc(10L)).thenReturn(new java.util.ArrayList<>());

        profileService.importOrganizationsAsExperience(1L, List.of("OpenAI", "Google"));

        verify(profileRepository).findByUserIdForUpdate(1L);
        verify(experienceRepository, times(2)).save(any(Experience.class));
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    void importLanguageExperience_withPessimisticLock() {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));
        when(experienceRepository.findByProfileIdOrderBySortOrderAsc(10L)).thenReturn(new java.util.ArrayList<>());

        profileService.importLanguageExperience(1L, "Rust", java.time.LocalDate.of(2023, 1, 1));

        verify(profileRepository).findByUserIdForUpdate(1L);
        verify(experienceRepository, times(1)).save(argThat(e -> e.getPosition().equals("Rust Developer")));
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    void concurrentUpdates_invokesPessimisticLockForEachThread() throws Exception {
        when(profileRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(profile));

        int threadCount = 10;
        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(threadCount);
        java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(threadCount);
        java.util.concurrent.atomic.AtomicInteger successCount = new java.util.concurrent.atomic.AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    UpdateProfileRequest req = new UpdateProfileRequest();
                    req.setFullName("User " + index);
                    profileService.update(1L, req);
                    successCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await(5, java.util.concurrent.TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(threadCount);
        verify(profileRepository, times(threadCount)).findByUserIdForUpdate(1L);
    }
}
