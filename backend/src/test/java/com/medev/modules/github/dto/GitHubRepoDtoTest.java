package com.medev.modules.github.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GitHubRepoDtoTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Deserializes full_name and private fields from GitHub API JSON")
    void testDeserializationFromGitHubJson() throws Exception {
        String json = """
            {
                \"id\": 987654321,
                \"name\": \"spring-cloud-k8s\",
                \"full_name\": \"spring-cloud/spring-cloud-k8s\",
                \"private\": true,
                \"html_url\": \"https://github.com/spring-cloud/spring-cloud-k8s\",
                \"description\": \"Kubernetes integration\",
                \"language\": \"Java\",
                \"stargazers_count\": 450,
                \"forks_count\": 120,
                \"size\": 15000,
                \"fork\": false,
                \"archived\": false
            }
            """;

        GitHubRepoDto repo = objectMapper.readValue(json, GitHubRepoDto.class);

        assertThat(repo.getId()).isEqualTo(987654321L);
        assertThat(repo.getName()).isEqualTo("spring-cloud-k8s");
        assertThat(repo.getFullName()).isEqualTo("spring-cloud/spring-cloud-k8s");
        assertThat(repo.getIsPrivate()).isTrue();
        assertThat(repo.isPrivate()).isTrue();
        assertThat(repo.isFork()).isFalse();
        assertThat(repo.isArchived()).isFalse();
        assertThat(repo.getHtmlUrl()).isEqualTo("https://github.com/spring-cloud/spring-cloud-k8s");
    }

    @Test
    @DisplayName("Serializes fullName to full_name and isPrivate to private")
    void testSerializationToGitHubJson() throws Exception {
        GitHubRepoDto repo = GitHubRepoDto.builder()
                .id(101L)
                .name("medev-backend")
                .fullName("medev-org/medev-backend")
                .isPrivate(true)
                .htmlUrl("https://github.com/medev-org/medev-backend")
                .build();

        String json = objectMapper.writeValueAsString(repo);

        assertThat(json).contains("\"full_name\":\"medev-org/medev-backend\"");
        assertThat(json).contains("\"private\":true");
    }

    @Test
    @DisplayName("getRepoPath returns fullName when present, fallback to defaultOwner/name or name")
    void testGetRepoPathResolution() {
        // 1. When fullName is present (e.g. organization repo)
        GitHubRepoDto orgRepo = GitHubRepoDto.builder()
                .name("data-pipeline")
                .fullName("acme-corp/data-pipeline")
                .build();
        assertThat(orgRepo.getRepoPath("john_doe")).isEqualTo("acme-corp/data-pipeline");

        // 2. When fullName is null or blank, falls back to defaultOwner/name
        GitHubRepoDto userRepo = GitHubRepoDto.builder()
                .name("personal-website")
                .fullName(null)
                .build();
        assertThat(userRepo.getRepoPath("john_doe")).isEqualTo("john_doe/personal-website");

        // 3. When both fullName and defaultOwner are null/blank
        GitHubRepoDto standaloneRepo = GitHubRepoDto.builder()
                .name("standalone-repo")
                .fullName("")
                .build();
        assertThat(standaloneRepo.getRepoPath(null)).isEqualTo("standalone-repo");
    }

    @Test
    @DisplayName("isPrivate helper correctly evaluates boolean values and nulls")
    void testIsPrivateHelper() {
        GitHubRepoDto repo = new GitHubRepoDto();
        assertThat(repo.isPrivate()).isFalse();

        repo.setIsPrivate(true);
        assertThat(repo.isPrivate()).isTrue();

        repo.setIsPrivate(false);
        assertThat(repo.isPrivate()).isFalse();
    }
}
