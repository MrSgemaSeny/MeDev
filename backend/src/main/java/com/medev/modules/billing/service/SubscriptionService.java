package com.medev.modules.billing.service;

import com.medev.modules.audit.service.AuditService;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Asserts that the given user has a PRO plan.
     * Throws an AccessDeniedException (403) if the user is on a FREE plan.
     * 
     * @param userId the ID of the user to check
     * @throws AccessDeniedException if user is not PRO
     */
    public void assertPro(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getPlan() != User.Plan.PRO) {
            throw new AccessDeniedException("This feature requires a PRO subscription.");
        }
        
        if (user.getSubscriptionExpiresAt() != null && user.getSubscriptionExpiresAt().isBefore(LocalDateTime.now())) {
            user.setPlan(User.Plan.FREE);
            userRepository.save(user);
            auditService.logAction(user.getId(), "BILLING_SUBSCRIPTION_EXPIRED", String.valueOf(user.getId()), "PRO subscription expired upon access check", null);
            throw new AccessDeniedException("Your PRO subscription has expired.");
        }
    }

    /**
     * Batch job to downgrade expired subscriptions.
     * Runs every hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void downgradeExpiredSubscriptions() {
        // Fetch all PRO users with expired subscriptions and downgrade them
        userRepository.findByPlanAndSubscriptionExpiresAtBefore(User.Plan.PRO, LocalDateTime.now())
                .forEach(user -> {
                    user.setPlan(User.Plan.FREE);
                    userRepository.save(user);
                    auditService.logAction(user.getId(), "BILLING_SUBSCRIPTION_EXPIRED", String.valueOf(user.getId()), "PRO subscription expired and downgraded to FREE by scheduler", null);
                });
    }
}
