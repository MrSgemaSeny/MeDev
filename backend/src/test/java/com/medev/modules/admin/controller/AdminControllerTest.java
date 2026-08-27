package com.medev.modules.admin.controller;

import com.medev.modules.admin.service.AdminService;
import com.medev.modules.auth.security.OAuth2LoginSuccessHandler;
import com.medev.modules.auth.service.CustomOAuth2UserService;
import com.medev.shared.security.JwtFilter;
import com.medev.shared.security.JwtService;
import com.medev.shared.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private JwtFilter jwtFilter;

    @MockitoBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockitoBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockitoBean
    private com.medev.modules.auth.security.OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @MockitoBean
    private com.medev.modules.auth.security.CookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @MockitoBean
    private org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDashboardStats_WithAdminRole_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/v1/admin/dashboard"))
                .andExpect(status().isOk());
    }
}
