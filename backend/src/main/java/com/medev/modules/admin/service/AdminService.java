package com.medev.modules.admin.service;

import com.medev.modules.admin.dto.AdminDashboardDto;
import com.medev.modules.audit.entity.AuditLog;
import com.medev.modules.audit.repository.AuditLogRepository;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public void updateUserPlan(Long userId, User.Plan plan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPlan(plan);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserRole(Long userId, User.Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long proUsers = 0; // Для этого нужен кастомный запрос в UserRepository, пока заглушка
        long auditCount = auditLogRepository.count();

        return AdminDashboardDto.builder()
                .totalUsers(totalUsers)
                .activeProUsers(proUsers)
                .totalAuditLogs(auditCount)
                .totalAiTokensUsedToday(0) // Заглушка, нужно тянуть из ai_usage
                .build();
    }
}
