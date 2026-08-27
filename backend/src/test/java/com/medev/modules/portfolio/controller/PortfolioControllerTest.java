package com.medev.modules.portfolio.controller;

import com.medev.modules.portfolio.dto.PublicProfileDto;
import com.medev.modules.portfolio.service.PortfolioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PortfolioController.class)
@AutoConfigureMockMvc(addFilters = false)
class PortfolioControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean
    private PortfolioService portfolioService;

    @MockitoBean
    private com.medev.shared.security.JwtService jwtService;

    @MockitoBean
    private com.medev.shared.security.JwtFilter jwtFilter;

    @MockitoBean
    private com.medev.shared.security.PublicRateLimiter publicRateLimiter;

    @Test
    void getPublicProfile_returnsProfile() throws Exception {
        PublicProfileDto dto = PublicProfileDto.builder().build();
        dto.setFullName("John Doe");

        when(portfolioService.getPublicProfile("johndoe")).thenReturn(dto);

        mockMvc.perform(get("/v1/portfolio/johndoe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("John Doe"));

        verify(portfolioService).getPublicProfile("johndoe");
    }
}
