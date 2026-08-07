package com.medev.modules.github.dto;

import lombok.Data;
import java.util.List;

@Data
public class GitHubImportRequest {
    private String token;
    private List<Long> selectedRepoIds;
}
