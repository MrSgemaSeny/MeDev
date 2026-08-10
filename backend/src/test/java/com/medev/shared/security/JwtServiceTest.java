package com.medev.shared.security;

import com.medev.modules.auth.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private User testUser;
    private final String deviceId = "device-123";

    @BeforeEach
    void setUp() {
        // Устанавливаем свойства через рефлексию, так как мы не используем Spring контекст (@Value)
        ReflectionTestUtils.setField(jwtService, "secret", "mysecretkeythatisatleast32charslong");
        ReflectionTestUtils.setField(jwtService, "expiration", 86400000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 2592000000L);

        testUser = User.builder()
                .id(1L)
                .email("test@test.com")
                .password("encoded")
                .username("testuser")
                .role(User.Role.USER)
                .plan(User.Plan.FREE)
                .build();
    }

    @Test
    void generateAccessToken_containsCorrectClaims() {
        String token = jwtService.generateAccessToken(testUser, deviceId);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractEmail(token)).isEqualTo("test@test.com");
        assertThat(jwtService.extractUserId(token)).isEqualTo(1L);
        assertThat(jwtService.extractDeviceId(token)).isEqualTo(deviceId);
        assertThat(jwtService.extractRole(token)).isEqualTo("USER");
    }

    @Test
    void generateRefreshToken_containsCorrectClaims() {
        String token = jwtService.generateRefreshToken(testUser, deviceId);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractEmail(token)).isEqualTo("test@test.com");
        assertThat(jwtService.extractUserId(token)).isEqualTo(1L);
    }

    @Test
    void extractUserId_returnsCorrectId() {
        String token = jwtService.generateAccessToken(testUser, deviceId);
        assertThat(jwtService.extractUserId(token)).isEqualTo(1L);
    }

    @Test
    void extractEmail_returnsCorrectEmail() {
        String token = jwtService.generateAccessToken(testUser, deviceId);
        assertThat(jwtService.extractEmail(token)).isEqualTo("test@test.com");
    }

    @Test
    void extractDeviceId_returnsCorrectDeviceId() {
        String token = jwtService.generateAccessToken(testUser, deviceId);
        assertThat(jwtService.extractDeviceId(token)).isEqualTo(deviceId);
    }

    @Test
    void extractRole_returnsCorrectRole() {
        String token = jwtService.generateAccessToken(testUser, deviceId);
        assertThat(jwtService.extractRole(token)).isEqualTo("USER");
    }

    @Test
    void validateToken_validToken_returnsTrue() {
        String token = jwtService.generateAccessToken(testUser, deviceId);
        assertThat(jwtService.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_expiredToken_returnsFalse() {
        // Устанавливаем время жизни токена в прошлое для генерации просроченного токена
        ReflectionTestUtils.setField(jwtService, "expiration", -1000L);
        String token = jwtService.generateAccessToken(testUser, deviceId);
        
        assertThat(jwtService.validateToken(token)).isFalse();
    }

    @Test
    void validateToken_tamperedToken_returnsFalse() {
        String token = jwtService.generateAccessToken(testUser, deviceId);
        String tamperedToken = token + "bad";
        
        assertThat(jwtService.validateToken(tamperedToken)).isFalse();
    }
}
