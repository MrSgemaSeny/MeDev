package com.medev.modules.billing.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final UserRepository userRepository;

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
        
        if (user.getSubscriptionExpiresAt() != null && user.getSubscriptionExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new AccessDeniedException("Your PRO subscription has expired.");
        }
    }
}
