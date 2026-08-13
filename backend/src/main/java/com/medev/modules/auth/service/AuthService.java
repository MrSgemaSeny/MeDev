package com.medev.modules.auth.service;

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

    public static final java.util.List<String> RESERVED_USERNAMES = java.util.List.of(
            "admin", "root", "system", "support", "billing", "me", "profile", "api", "auth"
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
                
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

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
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
                
        return buildAuthResponse(user, deviceId);
    }

    private AuthResponse buildAuthResponse(User user) {
        return buildAuthResponse(user, java.util.UUID.randomUUID().toString());
    }

    private AuthResponse buildAuthResponse(User user, String deviceId) {
        String accessToken  = jwtService.generateAccessToken(user, deviceId);
        String refreshToken = jwtService.generateRefreshToken(user, deviceId);

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
                .build();
    }

    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtService.validateToken(token)) {
                Long userId = jwtService.extractUserId(token);
                String deviceId = jwtService.extractDeviceId(token);
                if (deviceId != null) {
                    // Удаляем только текущую сессию (устройство)
                    redisTemplate.delete("refresh:" + userId + ":" + deviceId);
                } else {
                    // Для обратной совместимости, если старый токен без deviceId
                    redisTemplate.delete("refresh:" + userId);
                }
            }
        }
    }
}
