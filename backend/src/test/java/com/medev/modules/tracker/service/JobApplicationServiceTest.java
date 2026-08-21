package com.medev.modules.tracker.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.tracker.dto.CreateJobApplicationRequest;
import com.medev.modules.tracker.dto.JobApplicationDto;
import com.medev.modules.tracker.dto.UpdateJobApplicationRequest;
import com.medev.modules.tracker.entity.JobApplication;
import com.medev.modules.tracker.repository.JobApplicationRepository;
import com.medev.shared.exception.ForbiddenException;
import com.medev.shared.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.medev.modules.tracker.entity.ApplicationStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository repository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobApplicationService service;

    private User user;
    private JobApplication app;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@medev.com").build();
        app = JobApplication.builder()
                .id(10L)
                .user(user)
                .companyName("Tech Corp")
                .role("Senior Backend Developer")
                .status(ApplicationStatus.APPLIED)
                .jobUrl("https://example.com/job/123")
                .location("Remote")
                .salaryRange("$120k - $150k")
                .notes("Referral via Alice")
                .jobDescription("Java Spring Boot microservices")
                .matchScore(90)
                .matchFeedback("Great match for Java background")
                .appliedDate(LocalDate.of(2026, 1, 15))
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getAll returns user job applications ordered by update time")
    void testGetAll() {
        when(repository.findByUserIdOrderByUpdatedAtDesc(1L)).thenReturn(List.of(app));

        List<JobApplicationDto> result = service.getAll(1L);

        assertThat(result).hasSize(1);
        JobApplicationDto dto = result.get(0);
        assertThat(dto.getId()).isEqualTo(10L);
        assertThat(dto.getCompanyName()).isEqualTo("Tech Corp");
        assertThat(dto.getRole()).isEqualTo("Senior Backend Developer");
        assertThat(dto.getStatus()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(dto.getMatchScore()).isEqualTo(90);
    }

    @Test
    @DisplayName("create successfully persists new job application for user")
    void testCreate_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(repository.save(any(JobApplication.class))).thenAnswer(invocation -> {
            JobApplication saved = invocation.getArgument(0);
            saved.setId(10L);
            saved.setUpdatedAt(OffsetDateTime.now());
            return saved;
        });

        CreateJobApplicationRequest req = new CreateJobApplicationRequest();
        req.setCompanyName("Tech Corp");
        req.setRole("Senior Backend Developer");
        req.setStatus(ApplicationStatus.APPLIED);
        req.setJobUrl("https://example.com/job/123");
        req.setLocation("Remote");
        req.setSalaryRange("$120k - $150k");
        req.setNotes("Referral via Alice");
        req.setJobDescription("Java Spring Boot microservices");
        req.setMatchScore(90);
        req.setMatchFeedback("Great match for Java background");
        req.setAppliedDate(LocalDate.of(2026, 1, 15));

        JobApplicationDto result = service.create(1L, req);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getCompanyName()).isEqualTo("Tech Corp");
        assertThat(result.getMatchScore()).isEqualTo(90);
        verify(repository).save(any(JobApplication.class));
    }

    @Test
    @DisplayName("create throws NotFoundException when user does not exist")
    void testCreate_UserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        CreateJobApplicationRequest req = new CreateJobApplicationRequest();
        req.setCompanyName("Tech Corp");

        assertThatThrownBy(() -> service.create(99L, req))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("User not found");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("update successfully updates job application fields when owned by user")
    void testUpdate_Success() {
        when(repository.findById(10L)).thenReturn(Optional.of(app));
        when(repository.save(any(JobApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateJobApplicationRequest req = new UpdateJobApplicationRequest();
        req.setCompanyName("New Company");
        req.setRole("Lead Architect");
        req.setStatus(ApplicationStatus.INTERVIEW);
        req.setSalaryRange("$160k - $190k");

        JobApplicationDto result = service.update(1L, 10L, req);

        assertThat(result.getCompanyName()).isEqualTo("New Company");
        assertThat(result.getRole()).isEqualTo("Lead Architect");
        assertThat(result.getStatus()).isEqualTo(ApplicationStatus.INTERVIEW);
        assertThat(result.getSalaryRange()).isEqualTo("$160k - $190k");
        verify(repository).save(app);
    }

    @Test
    @DisplayName("update throws NotFoundException when application does not exist")
    void testUpdate_NotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        UpdateJobApplicationRequest req = new UpdateJobApplicationRequest();

        assertThatThrownBy(() -> service.update(1L, 999L, req))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Job application not found");
    }

    @Test
    @DisplayName("update throws ForbiddenException when application belongs to different user")
    void testUpdate_Forbidden() {
        User otherUser = User.builder().id(2L).build();
        JobApplication otherApp = JobApplication.builder().id(20L).user(otherUser).build();

        when(repository.findById(20L)).thenReturn(Optional.of(otherApp));

        UpdateJobApplicationRequest req = new UpdateJobApplicationRequest();

        assertThatThrownBy(() -> service.update(1L, 20L, req))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Not your application");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("delete successfully removes application when owned by user")
    void testDelete_Success() {
        when(repository.findById(10L)).thenReturn(Optional.of(app));

        service.delete(1L, 10L);

        verify(repository).delete(app);
    }

    @Test
    @DisplayName("delete throws NotFoundException when application not found")
    void testDelete_NotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(1L, 999L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Job application not found");

        verify(repository, never()).delete(any());
    }

    @Test
    @DisplayName("delete throws ForbiddenException when application belongs to different user")
    void testDelete_Forbidden() {
        User otherUser = User.builder().id(2L).build();
        JobApplication otherApp = JobApplication.builder().id(20L).user(otherUser).build();

        when(repository.findById(20L)).thenReturn(Optional.of(otherApp));

        assertThatThrownBy(() -> service.delete(1L, 20L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Not your application");

        verify(repository, never()).delete(any());
    }
}
