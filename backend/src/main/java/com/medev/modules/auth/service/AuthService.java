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

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RedisTemplate<String, String> redisTemplate;
    private final ProfileService profileService;

    public AuthResponse register(RegisterRequest request) {
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

        userRepository.save(user);

        // Создаём пустой профиль автоматически
        profileService.createEmptyProfile(user);

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
        // TODO: Implement refresh logic verifying token against Redis
        throw new UnsupportedOperationException("Not implemented yet");
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Refresh token в Redis с TTL 30 дней
        redisTemplate.opsForValue().set(
            "refresh:" + user.getId(),
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
            Long userId = jwtService.extractUserId(token);
            // Удаляем refresh token → нельзя обновить сессию
            redisTemplate.delete("refresh:" + userId);
        }
    }
}
