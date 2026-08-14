package com.medev.modules.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.auth.dto.AuthResponse;
import com.medev.modules.auth.dto.LoginRequest;
import com.medev.modules.auth.dto.RegisterRequest;
import com.medev.modules.auth.service.AuthRateLimiter;
import com.medev.modules.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.medev.AbstractIntegrationTest;

@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest extends AbstractIntegrationTest {

    @org.springframework.beans.factory.annotation.Autowired private MockMvc mockMvc;
    @org.springframework.beans.factory.annotation.Autowired private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private AuthRateLimiter authRateLimiter;

    @Test
    void register_success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@test.com");
        request.setPassword("Password123!");

        AuthResponse response = AuthResponse.builder().accessToken("access").refreshToken("refresh").build();
        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(cookie().exists("refresh_token"))
                .andExpect(cookie().value("refresh_token", "refresh"))
                .andExpect(cookie().httpOnly("refresh_token", true))
                .andExpect(cookie().secure("refresh_token", true))
                .andExpect(jsonPath("$.accessToken").value("access"));

        verify(authRateLimiter).checkAndConsume(any());
        verify(authService).register(any());
    }

    @Test
    void login_success() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("Password123!");

        AuthResponse response = AuthResponse.builder().accessToken("access").refreshToken("refresh").build();
        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("refresh_token"))
                .andExpect(jsonPath("$.accessToken").value("access"));

        verify(authRateLimiter).checkAndConsume(any());
        verify(authService).login(any());
    }

    @Test
    void refresh_success() throws Exception {
        AuthResponse response = AuthResponse.builder().accessToken("newAccess").refreshToken("newRefresh").build();
        when(authService.refresh("oldRefresh")).thenReturn(response);

        mockMvc.perform(post("/v1/auth/refresh")
                        .cookie(new Cookie("refresh_token", "oldRefresh")))
                .andExpect(status().isOk())
                .andExpect(cookie().value("refresh_token", "newRefresh"))
                .andExpect(jsonPath("$.accessToken").value("newAccess"));

        verify(authRateLimiter).checkAndConsume(any());
        verify(authService).refresh("oldRefresh");
    }

    @Test
    void refresh_missingCookie_returnsUnauthorized() throws Exception {
        mockMvc.perform(post("/v1/auth/refresh"))
                .andExpect(status().isUnauthorized());

        verify(authRateLimiter).checkAndConsume(any());
        verifyNoInteractions(authService);
    }

    @Test
    void logout_success() throws Exception {
        mockMvc.perform(post("/v1/auth/logout")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().exists("refresh_token"))
                .andExpect(cookie().maxAge("refresh_token", 0));

        verify(authService).logout("Bearer token");
    }
}
