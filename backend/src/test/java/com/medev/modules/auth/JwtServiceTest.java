package com.medev.modules.auth.service;

import com.medev.modules.auth.entity.User;
import com.medev.shared.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Set properties via reflection since there's no Spring context
        ReflectionTestUtils.setField(jwtService, "secret", "my_super_secret_key_which_must_be_long_enough_for_hmac_sha256");
        ReflectionTestUtils.setField(jwtService, "expiration", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 86400000L); // 24 hours

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
        testUser.setRole(User.Role.USER);
    }

    @Test
    void generateAndValidateAccessToken() {
        String deviceId = "device_1";
        String token = jwtService.generateAccessToken(testUser, deviceId);

        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));
        
        assertEquals("test@example.com", jwtService.extractEmail(token));
        assertEquals(1L, jwtService.extractUserId(token));
        assertEquals("device_1", jwtService.extractDeviceId(token));
        assertEquals("USER", jwtService.extractRole(token));
    }

    @Test
    void generateAndValidateRefreshToken() {
        String deviceId = "device_1";
        String token = jwtService.generateRefreshToken(testUser, deviceId);

        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));
        
        assertEquals("test@example.com", jwtService.extractEmail(token));
        assertEquals(1L, jwtService.extractUserId(token));
        assertEquals("device_1", jwtService.extractDeviceId(token));
    }

    @Test
    void validateToken_invalidToken_returnsFalse() {
        String invalidToken = "header.payload.signature";
        assertFalse(jwtService.validateToken(invalidToken));
    }
}
