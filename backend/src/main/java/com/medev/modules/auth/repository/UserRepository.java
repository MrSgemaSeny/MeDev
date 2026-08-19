package com.medev.modules.auth.repository;

import com.medev.modules.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByStripeCustomerId(String stripeCustomerId);
    Optional<User> findByKaspiCustomerId(String kaspiCustomerId);
    long countByPlan(User.Plan plan);
    java.util.List<User> findByPlanAndSubscriptionExpiresAtBefore(User.Plan plan, java.time.LocalDateTime dateTime);
}
