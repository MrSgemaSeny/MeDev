package com.medev.modules.github.controller;

import com.medev.modules.github.dto.GitHubImportRequest;
import com.medev.modules.github.dto.GitHubProfileDto;
import com.medev.modules.github.service.GitHubService;
import com.medev.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/github")
@RequiredArgsConstructor
public class GitHubController {

    private final GitHubService githubService;

    @GetMapping("/fetch")
    public ResponseEntity<GitHubProfileDto> fetchProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(githubService.fetchAndParseProfile(userId));
    }

    @PostMapping("/import")
    public ResponseEntity<Void> importProfile(@RequestBody GitHubImportRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        githubService.importToProfile(userId, request);
        return ResponseEntity.noContent().build();
    }
}
