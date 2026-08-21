package com.medev.modules.profile.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.profile.dto.*;
import com.medev.modules.profile.service.*;
import com.medev.shared.security.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProfileControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @MockBean private ProfileService profileService;
    @MockBean private ExperienceService experienceService;
    @MockBean private EducationService educationService;
    @MockBean private SkillService skillService;
    @MockBean private LanguageService languageService;
    @MockBean private ProjectService projectService;
    @MockBean private ReadmeGeneratorService readmeGeneratorService;
    @MockBean private com.medev.shared.security.JwtService jwtService;
    @MockBean private com.medev.shared.security.JwtFilter jwtFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(1L, null, List.of())
            );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getMyProfile_returnsProfile() throws Exception {
        ProfileDto dto = new ProfileDto();
        dto.setFullName("John Doe");
        when(profileService.getByUserId(1L)).thenReturn(dto);

        mockMvc.perform(get("/v1/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("John Doe"));
    }

    @Test
    void getReadme_returnsMarkdown() throws Exception {
        ProfileDto dto = ProfileDto.builder().id(1L).fullName("John Doe").build();
        when(profileService.getByUserId(1L)).thenReturn(dto);
        when(readmeGeneratorService.generateReadme(eq(dto), anyString())).thenReturn("# Hello");

        mockMvc.perform(get("/v1/profile/readme"))
                .andExpect(status().isOk())
                .andExpect(content().string("# Hello"));
    }

    @Test
    void updateProfile_returnsUpdated() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Jane");
        
        ProfileDto dto = new ProfileDto();
        dto.setFullName("Jane");

        when(profileService.update(eq(1L), any(UpdateProfileRequest.class))).thenReturn(dto);

        mockMvc.perform(put("/v1/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Jane"));
    }

    @Test
    void updateSectionOrder_returnsNoContent() throws Exception {
        Map<String, List<String>> request = Map.of("sectionOrder", List.of("skills", "experience"));

        mockMvc.perform(put("/v1/profile/section-order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(profileService).updateSectionOrder(1L, List.of("skills", "experience"));
    }

    @Test
    void addExperience_returnsCreated() throws Exception {
        ExperienceRequest request = new ExperienceRequest();
        request.setCompany("Tech");
        request.setPosition("Dev");
        request.setStartDate(java.time.LocalDate.of(2020, 1, 1));

        ExperienceDto dto = new ExperienceDto();
        dto.setCompany("Tech");

        when(experienceService.addExperience(eq(1L), any(ExperienceRequest.class))).thenReturn(dto);

        mockMvc.perform(post("/v1/profile/experience")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.company").value("Tech"));
    }
    
    @Test
    void deleteExperience_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/v1/profile/experience/10"))
                .andExpect(status().isNoContent());

        verify(experienceService).deleteExperience(1L, 10L);
    }
}
