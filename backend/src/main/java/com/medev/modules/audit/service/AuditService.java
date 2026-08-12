package com.medev.modules.audit.service;

import com.medev.modules.audit.entity.AuditLog;
import com.medev.modules.audit.repository.AuditLogRepository;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Async
    @Transactional
    public void logAction(Long userId, String action, String targetId, String details, String ipAddress) {
        try {
            User user = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
            }

            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .targetId(targetId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log: action={}, userId={}", action, userId, e);
        }
    }
}
