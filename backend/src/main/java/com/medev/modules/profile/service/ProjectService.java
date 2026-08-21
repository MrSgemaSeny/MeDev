package com.medev.modules.profile.service;

import com.medev.modules.profile.dto.ProfileMapper;
import com.medev.modules.profile.dto.ProjectDto;
import com.medev.modules.profile.dto.ProjectRequest;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.entity.Project;
import com.medev.modules.profile.repository.ProjectRepository;
import com.medev.shared.exception.ForbiddenException;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProfileMapper profileMapper;
    private final ProfileService profileService;

    @Transactional
    public ProjectDto addProject(Long userId, ProjectRequest request) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        Project project = Project.builder()
                .profile(profile)
                .name(request.getName())
                .description(request.getDescription())
                .techStack(request.getTechStack())
                .githubUrl(request.getGithubUrl())
                .liveUrl(request.getLiveUrl())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .build();
        projectRepository.save(project);
        return profileMapper.toDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long userId, Long id, ProjectRequest request) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        Project project = projectRepository.findById(id).orElseThrow(() -> new NotFoundException("Project not found"));
        if (!project.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setTechStack(request.getTechStack());
        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());
        project.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        project.setIsVisible(request.getIsVisible() != null ? request.getIsVisible() : true);
        projectRepository.save(project);
        return profileMapper.toDto(project);
    }

    @Transactional
    public void deleteProject(Long userId, Long id) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        Project project = projectRepository.findById(id).orElseThrow(() -> new NotFoundException("Project not found"));
        if (!project.getProfile().getId().equals(profile.getId())) throw new ForbiddenException("Access denied");
        projectRepository.delete(project);
    }

    @Transactional
    public void reorderProjects(Long userId, List<Long> orderedIds) {
        Profile profile = profileService.getProfileEntityForUpdate(userId);
        List<Project> items = projectRepository.findAllById(orderedIds);
        if (!items.stream().allMatch(e -> e.getProfile().getId().equals(profile.getId())) || items.size() != orderedIds.size()) {
            throw new ForbiddenException("Access denied");
        }
        for (int i = 0; i < orderedIds.size(); i++) {
            projectRepository.updateSortOrder(orderedIds.get(i), i);
        }
    }
}
