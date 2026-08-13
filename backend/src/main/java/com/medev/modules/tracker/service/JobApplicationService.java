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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getAll(Long userId) {
        return repository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobApplicationDto create(Long userId, CreateJobApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        JobApplication entity = JobApplication.builder()
                .user(user)
                .companyName(request.getCompanyName())
                .role(request.getRole())
                .status(request.getStatus())
                .jobUrl(request.getJobUrl())
                .location(request.getLocation())
                .salaryRange(request.getSalaryRange())
                .notes(request.getNotes())
                .jobDescription(request.getJobDescription())
                .matchScore(request.getMatchScore())
                .matchFeedback(request.getMatchFeedback())
                .appliedDate(request.getAppliedDate())
                .build();

        return toDto(repository.save(entity));
    }

    @Transactional
    public JobApplicationDto update(Long userId, Long id, UpdateJobApplicationRequest request) {
        JobApplication entity = getOwnedEntity(userId, id);

        if (request.getCompanyName() != null) entity.setCompanyName(request.getCompanyName());
        if (request.getRole() != null) entity.setRole(request.getRole());
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        if (request.getJobUrl() != null) entity.setJobUrl(request.getJobUrl());
        if (request.getLocation() != null) entity.setLocation(request.getLocation());
        if (request.getSalaryRange() != null) entity.setSalaryRange(request.getSalaryRange());
        if (request.getNotes() != null) entity.setNotes(request.getNotes());
        if (request.getJobDescription() != null) entity.setJobDescription(request.getJobDescription());
        if (request.getMatchScore() != null) entity.setMatchScore(request.getMatchScore());
        if (request.getMatchFeedback() != null) entity.setMatchFeedback(request.getMatchFeedback());
        if (request.getAppliedDate() != null) entity.setAppliedDate(request.getAppliedDate());

        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        JobApplication entity = getOwnedEntity(userId, id);
        repository.delete(entity);
    }

    private JobApplication getOwnedEntity(Long userId, Long id) {
        JobApplication entity = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Job application not found"));
        if (!entity.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Not your application");
        }
        return entity;
    }

    private JobApplicationDto toDto(JobApplication entity) {
        return JobApplicationDto.builder()
                .id(entity.getId())
                .companyName(entity.getCompanyName())
                .role(entity.getRole())
                .status(entity.getStatus())
                .jobUrl(entity.getJobUrl())
                .location(entity.getLocation())
                .salaryRange(entity.getSalaryRange())
                .notes(entity.getNotes())
                .jobDescription(entity.getJobDescription())
                .matchScore(entity.getMatchScore())
                .matchFeedback(entity.getMatchFeedback())
                .appliedDate(entity.getAppliedDate())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
