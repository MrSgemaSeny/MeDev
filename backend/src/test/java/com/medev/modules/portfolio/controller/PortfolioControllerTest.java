package com.medev.modules.portfolio.controller;

import com.medev.modules.portfolio.dto.PublicProfileDto;
import com.medev.modules.portfolio.service.PortfolioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import com.medev.AbstractIntegrationTest;

@AutoConfigureMockMvc(addFilters = false)
class PortfolioControllerTest extends AbstractIntegrationTest {

    @org.springframework.beans.factory.annotation.Autowired private MockMvc mockMvc;

    @MockBean
    private PortfolioService portfolioService;

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
