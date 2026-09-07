package com.medev.modules.auth.service;

import com.medev.modules.audit.service.AuditService;
import com.medev.modules.auth.dto.AuthResponse;
import com.medev.modules.auth.dto.LoginRequest;
import com.medev.modules.auth.dto.RegisterRequest;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.profile.service.ProfileService;
import com.medev.shared.exception.ConflictException;
import com.medev.shared.exception.UnauthorizedException;
import com.medev.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RedisTemplate<String, String> redisTemplate;
    private final ProfileService profileService;
    private final AuditService auditService;

    public static final java.util.List<String> RESERVED_USERNAMES = java.util.List.of(
            "admin", "root", "system", "support", "billing", "me", "profile", "api", "auth",
            "login", "medev", "register"
    );

    public AuthResponse register(RegisterRequest request) {
        String reqUsername = request.getUsername().toLowerCase();
        if (RESERVED_USERNAMES.contains(reqUsername)) {
            throw new ConflictException("Username is reserved");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already taken");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername().toLowerCase())
                .role(User.Role.USER)
                .plan(User.Plan.FREE)
                .build();

        try {
            userRepository.save(user);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ConflictException("Username or Email already in use");
        }

        // Создаём пустой профиль автоматически
        profileService.createEmptyProfile(user);
        auditService.logAction(user.getId(), "AUTH_REGISTER_SUCCESS", String.valueOf(user.getId()), "User registered with email: " + user.getEmail(), null);

        return buildAuthResponse(user);
    }
    
    public AuthResponse exchangeOauth2Code(String code) {
        String userIdStr = redisTemplate.opsForValue().get("oauth2_code:" + code);
        if (userIdStr == null) {
            throw new UnauthorizedException("Invalid or expired OAuth2 code");
        }
        
        // Remove code to prevent reuse
        redisTemplate.delete("oauth2_code:" + code);
        
        Long userId = Long.parseLong(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
                
        auditService.logAction(user.getId(), "AUTH_OAUTH2_EXCHANGE_SUCCESS", String.valueOf(user.getId()), "OAuth2 code exchanged for user: " + user.getUsername(), null);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            auditService.logAction(null, "AUTH_LOGIN_FAILURE", request.getEmail(), "Login failed: user not found with email: " + request.getEmail(), null);
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            auditService.logAction(user.getId(), "AUTH_LOGIN_FAILURE", String.valueOf(user.getId()), "Login failed: incorrect password", null);
            throw new UnauthorizedException("Invalid credentials");
        }

        auditService.logAction(user.getId(), "AUTH_LOGIN_SUCCESS", String.valueOf(user.getId()), "User logged in successfully", null);
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        
        String type = jwtService.extractType(refreshToken);
        if (!"refresh".equals(type)) {
            throw new UnauthorizedException("Invalid token type");
        }
        
        Long userId = jwtService.extractUserId(refreshToken);
        String deviceId = jwtService.extractDeviceId(refreshToken);
        
        if (deviceId == null) {
            throw new UnauthorizedException("Invalid refresh token format");
        }
        
        String redisToken = redisTemplate.opsForValue().get("refresh:" + userId + ":" + deviceId);
        
        if (redisToken == null || !redisToken.equals(refreshToken)) {
            String graceToken = redisTemplate.opsForValue().get("refresh:" + userId + ":" + deviceId + ":grace");
            if (graceToken == null || !graceToken.equals(refreshToken)) {
                throw new UnauthorizedException("Invalid or expired refresh token");
            }
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
                
        auditService.logAction(user.getId(), "AUTH_TOKEN_REFRESH_SUCCESS", String.valueOf(user.getId()), "Token refreshed for device: " + deviceId, null);
        return buildAuthResponse(user, deviceId);
    }

    private AuthResponse buildAuthResponse(User user) {
        return buildAuthResponse(user, java.util.UUID.randomUUID().toString());
    }

    private AuthResponse buildAuthResponse(User user, String deviceId) {
        String accessToken  = jwtService.generateAccessToken(user, deviceId);
        String refreshToken = jwtService.generateRefreshToken(user, deviceId);

        // Сохраняем старый токен в grace-период на 15 секунд для параллельных запросов со вкладок
        String currentToken = redisTemplate.opsForValue().get("refresh:" + user.getId() + ":" + deviceId);
        if (currentToken != null) {
            redisTemplate.opsForValue().set(
                "refresh:" + user.getId() + ":" + deviceId + ":grace",
                currentToken,
                Duration.ofSeconds(15)
            );
        }

        // Refresh token в Redis с TTL 30 дней, ключ привязан к устройству
        redisTemplate.opsForValue().set(
            "refresh:" + user.getId() + ":" + deviceId,
            refreshToken,
            Duration.ofDays(30)
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .plan(user.getPlan().name())
                .role(user.getRole().name())
                .build();
    }

    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtService.validateToken(token)) {
                Long userId = jwtService.extractUserId(token);
                String deviceId = jwtService.extractDeviceId(token);
                if (deviceId != null) {
                    // Удаляем текущую сессию и ее grace токен
                    redisTemplate.delete("refresh:" + userId + ":" + deviceId);
                    redisTemplate.delete("refresh:" + userId + ":" + deviceId + ":grace");
                } else {
                    // Для обратной совместимости, если старый токен без deviceId
                    redisTemplate.delete("refresh:" + userId);
                }

                // Blacklist the access token until its expiration
                try {
                    java.util.Date exp = jwtService.extractExpiration(token);
                    long remainingMs = exp.getTime() - System.currentTimeMillis();
                    if (remainingMs > 0) {
                        redisTemplate.opsForValue().set("blacklist:access:" + token, "revoked", Duration.ofMillis(remainingMs));
                    }
                } catch (Exception ignored) {}

                auditService.logAction(userId, "AUTH_LOGOUT", String.valueOf(userId), "User logged out session", null);
            }
        }
    }

    public void forgotPassword(com.medev.modules.auth.dto.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user != null) {
            byte[] randomBytes = new byte[32];
            new java.security.SecureRandom().nextBytes(randomBytes);
            StringBuilder sb = new StringBuilder(64);
            for (byte b : randomBytes) {
                sb.append(String.format("%02x", b));
            }
            String token = sb.toString();
            redisTemplate.opsForValue().set("password_reset:token:" + token, String.valueOf(user.getId()), Duration.ofMinutes(15));
            auditService.logAction(user.getId(), "AUTH_PASSWORD_RESET_REQUESTED", String.valueOf(user.getId()), "Password reset requested for email: " + user.getEmail(), null);
        }
    }

    public void resetPassword(com.medev.modules.auth.dto.ResetPasswordRequest request) {
        String key = "password_reset:token:" + request.getToken();
        String userIdStr = redisTemplate.opsForValue().get(key);
        if (userIdStr == null) {
            throw new IllegalArgumentException("Invalid or expired password reset token");
        }

        redisTemplate.delete(key);

        Long userId = Long.parseLong(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.medev.shared.exception.NotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate all active refresh sessions for user
        java.util.Set<String> sessionKeys = redisTemplate.keys("refresh:" + userId + ":*");
        if (sessionKeys != null && !sessionKeys.isEmpty()) {
            redisTemplate.delete(sessionKeys);
        }
        redisTemplate.delete("refresh:" + userId);

        auditService.logAction(userId, "AUTH_PASSWORD_RESET_SUCCESS", String.valueOf(userId), "Password reset successful, sessions invalidated", null);
    }
}
