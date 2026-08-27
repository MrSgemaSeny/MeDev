package com.medev.modules.github.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.github.dto.GitHubImportRequest;
import com.medev.modules.github.dto.GitHubProfileDto;
import com.medev.modules.github.service.GitHubService;
import com.medev.shared.security.JwtFilter;
import com.medev.shared.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GitHubController.class)
@AutoConfigureMockMvc(addFilters = false)
class GitHubControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GitHubService githubService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private JwtFilter jwtFilter;

    @BeforeEach
    void setUp() {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("GET /v1/github/fetch returns parsed GitHub profile")
    void fetchProfile_returnsProfile() throws Exception {
        GitHubProfileDto dto = GitHubProfileDto.builder()
                .username("octocat")
                .name("The Octocat")
                .bio("GitHub mascot")
                .build();

        when(githubService.fetchAndParseProfile(1L)).thenReturn(dto);

        mockMvc.perform(get("/v1/github/fetch"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("octocat"))
                .andExpect(jsonPath("$.name").value("The Octocat"));

        verify(githubService).fetchAndParseProfile(1L);
    }

    @Test
    @DisplayName("POST /v1/github/import imports profile and returns no content")
    void importProfile_returnsNoContent() throws Exception {
        GitHubImportRequest req = new GitHubImportRequest();

        mockMvc.perform(post("/v1/github/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNoContent());

        verify(githubService).importToProfile(eq(1L), any(GitHubImportRequest.class));
    }
}
