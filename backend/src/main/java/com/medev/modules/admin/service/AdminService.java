package com.medev.modules.admin.service;

import com.medev.modules.admin.dto.AdminDashboardDto;
import com.medev.modules.admin.dto.AdminUserDto;
import com.medev.modules.ai.repository.AiUsageRepository;
import com.medev.modules.audit.entity.AuditLog;
import com.medev.modules.audit.repository.AuditLogRepository;
import com.medev.modules.audit.service.AuditService;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.NotFoundException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AiUsageRepository aiUsageRepository;
    private final AuditService auditService;
    private final org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public Page<AdminUserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(AdminUserDto::fromEntity);
    }

    @Transactional
    public void updateUserPlan(Long userId, User.Plan plan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setPlan(plan);
        userRepository.save(user);
        auditService.logAction(userId, "ADMIN_PLAN_UPDATE", String.valueOf(userId), "Admin updated plan to " + plan.name(), null);
        redisTemplate.delete("user_plan:" + userId);
    }

    @Transactional
    public void updateUserRole(Long userId, User.Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setRole(role);
        userRepository.save(user);
        auditService.logAction(userId, "ADMIN_ROLE_UPDATE", String.valueOf(userId), "Admin updated role to " + role.name(), null);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        userRepository.delete(user);
        auditService.logAction(userId, "ADMIN_USER_DELETE", String.valueOf(userId), "Admin deleted user: " + user.getUsername(), null);
    }

    @org.springframework.beans.factory.annotation.Value("${app.owner-username:mrsgemaseny}")
    private String ownerUsername;

    @Transactional
    public Map<String, Object> cleanupTestData() {
        String safeOwner = (ownerUsername != null && !ownerUsername.isBlank()) ? ownerUsername.trim() : "mrsgemaseny";
        String deleteAuditLogsSql = "DELETE FROM audit_logs WHERE user_id IN (" +
                "SELECT id FROM users WHERE (username != :owner AND (email IS NULL OR LOWER(email) NOT LIKE :ownerPattern)) " +
                "AND (username LIKE 'art_%' OR username LIKE 'usr_%' OR username LIKE 'auth_%' " +
                "OR username LIKE 'profile_%' OR username LIKE 'resume_%' OR username LIKE 'portfolio_%' " +
                "OR username LIKE 'tracker_%' OR username LIKE 'ai_%' OR username LIKE 'github_%' " +
                "OR username LIKE 'admin_%' OR username LIKE 'e2e_%' OR email LIKE '%artillery%' " +
                "OR email LIKE '%medev-test.local%' OR email LIKE '%testmail.com%' OR email LIKE '%@github.user.medev.com')) " +
                "OR details LIKE '%artillery%' OR details LIKE '%e2e_%' OR details LIKE '%testmail%' OR details LIKE '%medev-test.local%'";
        int deletedLogs = entityManager.createNativeQuery(deleteAuditLogsSql)
                .setParameter("owner", safeOwner)
                .setParameter("ownerPattern", "%" + safeOwner.toLowerCase() + "%")
                .executeUpdate();

        String deleteUsersSql = "DELETE FROM users WHERE (username != :owner AND (email IS NULL OR LOWER(email) NOT LIKE :ownerPattern)) " +
                "AND (username LIKE 'art_%' OR username LIKE 'usr_%' OR username LIKE 'auth_%' " +
                "OR username LIKE 'profile_%' OR username LIKE 'resume_%' OR username LIKE 'portfolio_%' " +
                "OR username LIKE 'tracker_%' OR username LIKE 'ai_%' OR username LIKE 'github_%' " +
                "OR username LIKE 'admin_%' OR username LIKE 'e2e_%' OR email LIKE '%artillery%' " +
                "OR email LIKE '%medev-test.local%' OR email LIKE '%testmail.com%' OR email LIKE '%@github.user.medev.com')";
        int deletedUsers = entityManager.createNativeQuery(deleteUsersSql)
                .setParameter("owner", safeOwner)
                .setParameter("ownerPattern", "%" + safeOwner.toLowerCase() + "%")
                .executeUpdate();

        return Map.of("deletedUsers", deletedUsers, "deletedLogs", deletedLogs);
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
