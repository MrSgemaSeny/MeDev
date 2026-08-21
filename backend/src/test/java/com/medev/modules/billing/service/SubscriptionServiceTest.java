package com.medev.modules.billing.service;

import com.medev.modules.audit.service.AuditService;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SubscriptionServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    private SubscriptionService subscriptionService;

    @BeforeEach
    void setUp() {
        subscriptionService = new SubscriptionService(userRepository, auditService);
    }

    @Test
    @DisplayName("assertPro: Throws AccessDeniedException when user is on FREE plan")
    void assertPro_freePlan_throwsAccessDeniedException() {
        Long userId = 1L;
        User freeUser = User.builder()
                .id(userId)
                .email("free@example.com")
                .plan(User.Plan.FREE)
                .build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(freeUser));

        assertThatThrownBy(() -> subscriptionService.assertPro(userId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("This feature requires a PRO subscription.");
    }

    @Test
    @DisplayName("assertPro: Succeeds when user is on active PRO plan")
    void assertPro_activeProPlan_succeeds() {
        Long userId = 2L;
        User proUser = User.builder()
                .id(userId)
                .email("pro@example.com")
                .plan(User.Plan.PRO)
                .subscriptionExpiresAt(LocalDateTime.now().plusDays(30))
                .build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(proUser));

        subscriptionService.assertPro(userId);

        verify(userRepository).findById(userId);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("assertPro: Downgrades to FREE and throws AccessDeniedException when PRO subscription is expired")
    void assertPro_expiredProPlan_downgradesAndThrowsAccessDeniedException() {
        Long userId = 3L;
        User expiredUser = User.builder()
                .id(userId)
                .email("expired@example.com")
                .plan(User.Plan.PRO)
                .subscriptionExpiresAt(LocalDateTime.now().minusDays(1))
                .build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(expiredUser));

        assertThatThrownBy(() -> subscriptionService.assertPro(userId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Your PRO subscription has expired.");

        assertThat(expiredUser.getPlan()).isEqualTo(User.Plan.FREE);
        verify(userRepository).save(expiredUser);
    }

    @Test
    @DisplayName("assertPro: Throws IllegalArgumentException when user does not exist")
    void assertPro_userNotFound_throwsIllegalArgumentException() {
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> subscriptionService.assertPro(userId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
    }

    @Test
    @DisplayName("downgradeExpiredSubscriptions: Batch downgrades all expired PRO users")
    void downgradeExpiredSubscriptions_batchDowngrade() {
        User user1 = User.builder().id(10L).plan(User.Plan.PRO).subscriptionExpiresAt(LocalDateTime.now().minusHours(2)).build();
        User user2 = User.builder().id(11L).plan(User.Plan.PRO).subscriptionExpiresAt(LocalDateTime.now().minusDays(5)).build();

        when(userRepository.findByPlanAndSubscriptionExpiresAtBefore(eq(User.Plan.PRO), any(LocalDateTime.class)))
                .thenReturn(List.of(user1, user2));

        subscriptionService.downgradeExpiredSubscriptions();

        assertThat(user1.getPlan()).isEqualTo(User.Plan.FREE);
        assertThat(user2.getPlan()).isEqualTo(User.Plan.FREE);
        verify(userRepository, times(2)).save(any(User.class));
    }
}
