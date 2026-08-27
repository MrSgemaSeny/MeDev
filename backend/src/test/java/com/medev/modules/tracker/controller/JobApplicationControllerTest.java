package com.medev.modules.tracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.tracker.dto.CreateJobApplicationRequest;
import com.medev.modules.tracker.dto.JobApplicationDto;
import com.medev.modules.tracker.dto.UpdateJobApplicationRequest;
import com.medev.modules.tracker.service.JobApplicationService;
import com.medev.modules.tracker.service.WebScraperService;
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

import com.medev.modules.tracker.entity.ApplicationStatus;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
class JobApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JobApplicationService service;

    @MockitoBean
    private WebScraperService scraperService;

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
    @DisplayName("GET /v1/tracker/applications returns list of applications")
    void getAll_returnsList() throws Exception {
        JobApplicationDto dto = JobApplicationDto.builder()
                .id(10L)
                .companyName("Acme Inc")
                .role("Software Engineer")
                .status(ApplicationStatus.APPLIED)
                .build();

        when(service.getAll(1L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/v1/tracker/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L))
                .andExpect(jsonPath("$[0].companyName").value("Acme Inc"))
                .andExpect(jsonPath("$[0].role").value("Software Engineer"));

        verify(service).getAll(1L);
    }

    @Test
    @DisplayName("GET /v1/tracker/applications/scrape parses url into CreateJobApplicationRequest")
    void scrape_returnsParsedRequest() throws Exception {
        CreateJobApplicationRequest scraped = new CreateJobApplicationRequest();
        scraped.setCompanyName("Google");
        scraped.setRole("Staff Engineer");

        when(scraperService.scrapeJobUrl("https://careers.google.com/jobs/123")).thenReturn(scraped);

        mockMvc.perform(get("/v1/tracker/applications/scrape")
                        .param("url", "https://careers.google.com/jobs/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Google"))
                .andExpect(jsonPath("$.role").value("Staff Engineer"));

        verify(scraperService).scrapeJobUrl("https://careers.google.com/jobs/123");
    }

    @Test
    @DisplayName("POST /v1/tracker/applications creates and returns job application")
    void create_returnsCreated() throws Exception {
        CreateJobApplicationRequest req = new CreateJobApplicationRequest();
        req.setCompanyName("Meta");
        req.setRole("Production Engineer");
        req.setStatus(ApplicationStatus.APPLIED);

        JobApplicationDto dto = JobApplicationDto.builder()
                .id(20L)
                .companyName("Meta")
                .role("Production Engineer")
                .status(ApplicationStatus.APPLIED)
                .build();

        when(service.create(eq(1L), any(CreateJobApplicationRequest.class))).thenReturn(dto);

        mockMvc.perform(post("/v1/tracker/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(20L))
                .andExpect(jsonPath("$.companyName").value("Meta"));

        verify(service).create(eq(1L), any(CreateJobApplicationRequest.class));
    }

    @Test
    @DisplayName("PUT /v1/tracker/applications/{id} updates and returns application")
    void update_returnsUpdated() throws Exception {
        UpdateJobApplicationRequest req = new UpdateJobApplicationRequest();
        req.setCompanyName("Meta Updated");
        req.setStatus(ApplicationStatus.INTERVIEW);

        JobApplicationDto dto = JobApplicationDto.builder()
                .id(20L)
                .companyName("Meta Updated")
                .status(ApplicationStatus.INTERVIEW)
                .build();

        when(service.update(eq(1L), eq(20L), any(UpdateJobApplicationRequest.class))).thenReturn(dto);

        mockMvc.perform(put("/v1/tracker/applications/20")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Meta Updated"))
                .andExpect(jsonPath("$.status").value("INTERVIEW"));

        verify(service).update(eq(1L), eq(20L), any(UpdateJobApplicationRequest.class));
    }

    @Test
    @DisplayName("DELETE /v1/tracker/applications/{id} returns no content")
    void delete_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/v1/tracker/applications/20"))
                .andExpect(status().isNoContent());

        verify(service).delete(1L, 20L);
    }
}
