package com.medev.modules.admin.controller;

import com.medev.modules.admin.service.AdminService;
import com.medev.modules.auth.security.OAuth2LoginSuccessHandler;
import com.medev.modules.auth.service.CustomOAuth2UserService;
import com.medev.shared.security.JwtFilter;
import com.medev.shared.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtFilter jwtFilter;

    @MockBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private com.medev.modules.auth.security.OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @MockBean
    private com.medev.modules.auth.security.CookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @MockBean
    private org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(1L, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getDashboardStats_WithAdminRole_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/v1/admin/dashboard"))
                .andExpect(status().isOk());
    }

    @Test
    void cleanupTestData_WithAdminRole_ShouldReturnOk() throws Exception {
        when(adminService.cleanupTestData()).thenReturn(Map.of("deletedUsers", 83, "deletedLogs", 200));

        mockMvc.perform(post("/v1/admin/cleanup-test-data"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteUser_WithAdminRole_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/v1/admin/users/99"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteUser_SelfDeletion_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(delete("/v1/admin/users/1"))
                .andExpect(status().isForbidden());
    }
}
