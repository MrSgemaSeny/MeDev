package com.medev.modules.admin.service;

import com.medev.modules.admin.dto.AdminDashboardDto;
import com.medev.modules.admin.dto.AdminUserDto;
import com.medev.modules.ai.repository.AiUsageRepository;
import com.medev.modules.audit.entity.AuditLog;
import com.medev.modules.audit.repository.AuditLogRepository;
import com.medev.modules.audit.service.AuditService;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private AiUsageRepository aiUsageRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AdminService adminService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(10L)
                .email("user@medev.com")
                .username("user10")
                .plan(User.Plan.FREE)
                .role(User.Role.USER)
                .build();
    }

    @Test
    @DisplayName("getDashboardStats queries AiUsageRepository for live today token accounting")
    void testGetDashboardStats_LiveAiUsage() {
        when(userRepository.count()).thenReturn(150L);
        when(userRepository.countByPlan(User.Plan.PRO)).thenReturn(42L);
        when(auditLogRepository.count()).thenReturn(800L);
        when(aiUsageRepository.sumTotalTokensSince(any(Instant.class))).thenReturn(125000L);

        AdminDashboardDto stats = adminService.getDashboardStats();

        assertThat(stats.getTotalUsers()).isEqualTo(150L);
        assertThat(stats.getActiveProUsers()).isEqualTo(42L);
        assertThat(stats.getTotalAuditLogs()).isEqualTo(800L);
        assertThat(stats.getTotalAiTokensUsedToday()).isEqualTo(125000L);

        verify(aiUsageRepository).sumTotalTokensSince(any(Instant.class));
    }

    @Test
    @DisplayName("updateUserPlan updates plan and logs audit action")
    void testUpdateUserPlan_Success() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        adminService.updateUserPlan(10L, User.Plan.PRO);

        assertThat(user.getPlan()).isEqualTo(User.Plan.PRO);
        verify(userRepository).save(user);
        verify(auditService).logAction(eq(10L), eq("ADMIN_PLAN_UPDATE"), eq("10"), contains("PRO"), isNull());
    }

    @Test
    @DisplayName("updateUserRole updates role and logs audit action")
    void testUpdateUserRole_Success() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        adminService.updateUserRole(10L, User.Role.ADMIN);

        assertThat(user.getRole()).isEqualTo(User.Role.ADMIN);
        verify(userRepository).save(user);
        verify(auditService).logAction(eq(10L), eq("ADMIN_ROLE_UPDATE"), eq("10"), contains("ADMIN"), isNull());
    }

    @Test
    @DisplayName("updateUserPlan throws when user not found")
    void testUpdateUserPlan_NotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.updateUserPlan(99L, User.Plan.PRO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("getAllUsers returns mapped page of users")
    void testGetAllUsers() {
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(user)));

        Page<AdminUserDto> page = adminService.getAllUsers(pageable);

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getEmail()).isEqualTo("user@medev.com");
    }

    @Test
    @DisplayName("getAuditLogs returns page of audit logs")
    void testGetAuditLogs() {
        Pageable pageable = PageRequest.of(0, 10);
        AuditLog log = AuditLog.builder().id(1L).action("TEST_ACTION").build();
        when(auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)).thenReturn(new PageImpl<>(List.of(log)));

        Page<AuditLog> page = adminService.getAuditLogs(pageable);

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getAction()).isEqualTo("TEST_ACTION");
    }
}
