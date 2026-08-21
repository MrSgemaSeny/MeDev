package com.medev.modules.auth.service;

import com.medev.modules.auth.dto.AuthResponse;
import com.medev.modules.auth.dto.LoginRequest;
import com.medev.modules.auth.dto.RegisterRequest;
import com.medev.modules.auth.entity.User;
import com.medev.shared.exception.ConflictException;
import com.medev.shared.exception.UnauthorizedException;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.profile.service.ProfileService;
import com.medev.shared.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private ProfileService profileService;

    @Mock
    private com.medev.modules.audit.service.AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@test.com")
                .password("encoded")
                .username("testuser")
                .role(User.Role.USER)
                .plan(User.Plan.FREE)
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@test.com");
        registerRequest.setPassword("password");
        registerRequest.setUsername("testuser");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("password");
    }

    @Test
    void register_happyPath() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateAccessToken(any(User.class), anyString())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class), anyString())).thenReturn("refresh-token");
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        
        verify(userRepository).save(any(User.class));
        verify(profileService).createEmptyProfile(any(User.class));
        verify(valueOperations).set(anyString(), eq("refresh-token"), any(Duration.class));
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email already in use");
    }

    @Test
    void register_duplicateUsername_throwsConflict() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Username already taken");
    }

    @Test
    void register_reservedUsername_throwsConflict() {
        registerRequest.setUsername("admin");

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Username is reserved");
    }

    @Test
    void login_happyPath() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtService.generateAccessToken(any(User.class), anyString())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class), anyString())).thenReturn("refresh-token");
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
    }

    @Test
    void login_wrongEmail_throwsUnauthorized() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void login_wrongPassword_throwsUnauthorized() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void refresh_happyPath() {
        String token = "valid-refresh";
        String deviceId = "dev123";
        
        when(jwtService.validateToken(token)).thenReturn(true);
        when(jwtService.extractType(token)).thenReturn("refresh");
        when(jwtService.extractUserId(token)).thenReturn(1L);
        when(jwtService.extractDeviceId(token)).thenReturn(deviceId);
        
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("refresh:1:" + deviceId)).thenReturn(token);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        when(jwtService.generateAccessToken(testUser, deviceId)).thenReturn("new-access");
        when(jwtService.generateRefreshToken(testUser, deviceId)).thenReturn("new-refresh");

        AuthResponse response = authService.refresh(token);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("new-access");
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
    }

    @Test
    void refresh_invalidToken_throwsUnauthorized() {
        String token = "invalid-refresh";
        when(jwtService.validateToken(token)).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh(token))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid refresh token");
    }

    @Test
    void logout_deletesRedisKey() {
        String token = "valid-token";
        String deviceId = "dev123";
        String bearer = "Bearer " + token;

        when(jwtService.validateToken(token)).thenReturn(true);
        when(jwtService.extractUserId(token)).thenReturn(1L);
        when(jwtService.extractDeviceId(token)).thenReturn(deviceId);

        authService.logout(bearer);

        verify(redisTemplate).delete("refresh:1:" + deviceId);
    }
}
