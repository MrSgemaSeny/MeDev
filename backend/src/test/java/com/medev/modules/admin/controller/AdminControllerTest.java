package com.medev.modules.admin.controller;

import com.medev.modules.admin.service.AdminService;
import com.medev.shared.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @Test
    void getDashboardStats_WithoutAuth_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/v1/admin/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void getDashboardStats_WithUserRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/v1/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDashboardStats_WithAdminRole_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/v1/admin/dashboard"))
                .andExpect(status().isOk());
    }
}
