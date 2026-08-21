package com.medev.modules.admin.service;

import com.medev.modules.admin.dto.AdminDashboardDto;
import com.medev.modules.admin.dto.AdminUserDto;
import com.medev.modules.ai.repository.AiUsageRepository;
import com.medev.modules.audit.entity.AuditLog;
import com.medev.modules.audit.repository.AuditLogRepository;
import com.medev.modules.audit.service.AuditService;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AiUsageRepository aiUsageRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<AdminUserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(AdminUserDto::fromEntity);
    }

    @Transactional
    public void updateUserPlan(Long userId, User.Plan plan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPlan(plan);
        userRepository.save(user);
        auditService.logAction(userId, "ADMIN_PLAN_UPDATE", String.valueOf(userId), "Admin updated plan to " + plan.name(), null);
    }

    @Transactional
    public void updateUserRole(Long userId, User.Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepository.save(user);
        auditService.logAction(userId, "ADMIN_ROLE_UPDATE", String.valueOf(userId), "Admin updated role to " + role.name(), null);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long proUsers = userRepository.countByPlan(User.Plan.PRO);
        long auditCount = auditLogRepository.count();

        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        long totalAiTokensToday = aiUsageRepository.sumTotalTokensSince(startOfDay);

        return AdminDashboardDto.builder()
                .totalUsers(totalUsers)
                .activeProUsers(proUsers)
                .totalAuditLogs(auditCount)
                .totalAiTokensUsedToday(totalAiTokensToday)
                .build();
    }
}
