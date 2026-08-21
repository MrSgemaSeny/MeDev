package com.medev.modules.audit.service;

import com.medev.modules.audit.entity.AuditLog;
import com.medev.modules.audit.repository.AuditLogRepository;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuditService auditService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(100L).email("user@medev.com").username("medev_user").build();
    }

    @Test
    @DisplayName("logAction persists AuditLog with resolved user and details")
    void testLogAction_WithUser() {
        when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));

        auditService.logAction(100L, "AUTH_LOGIN_SUCCESS", "100", "Logged in via Web", "127.0.0.1");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertThat(saved.getUser()).isEqualTo(testUser);
        assertThat(saved.getAction()).isEqualTo("AUTH_LOGIN_SUCCESS");
        assertThat(saved.getTargetId()).isEqualTo("100");
        assertThat(saved.getDetails()).isEqualTo("Logged in via Web");
        assertThat(saved.getIpAddress()).isEqualTo("127.0.0.1");
    }

    @Test
    @DisplayName("logAction handles null userId gracefully (e.g. failed unauthenticated login)")
    void testLogAction_NullUser() {
        auditService.logAction(null, "AUTH_LOGIN_FAILURE", "unknown@test.com", "Invalid credentials", "192.168.1.1");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        verify(userRepository, never()).findById(any());

        AuditLog saved = captor.getValue();
        assertThat(saved.getUser()).isNull();
        assertThat(saved.getAction()).isEqualTo("AUTH_LOGIN_FAILURE");
        assertThat(saved.getTargetId()).isEqualTo("unknown@test.com");
    }

    @Test
    @DisplayName("logAction catches repository exception gracefully without blowing up the caller")
    void testLogAction_ExceptionHandledGracefully() {
        when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
        when(auditLogRepository.save(any(AuditLog.class))).thenThrow(new RuntimeException("DB down"));

        // Should not throw
        auditService.logAction(100L, "TEST_ACTION", "target", "details", null);

        verify(auditLogRepository).save(any(AuditLog.class));
    }
}
