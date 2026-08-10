package com.medev.modules.auth.security;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.security.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = (String) oAuth2User.getAttributes().get("email");
        if (email == null) {
            String login = (String) oAuth2User.getAttributes().get("login");
            email = login + "@github.user.medev.com";
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after OAuth2 login"));

        String deviceId = UUID.randomUUID().toString();
        String accessToken = jwtService.generateAccessToken(user, deviceId);
        String refreshToken = jwtService.generateRefreshToken(user, deviceId);

        redisTemplate.opsForValue().set(
            "refresh:" + user.getId() + ":" + deviceId,
            refreshToken,
            Duration.ofDays(30)
        );

        String frontendUrl = "http://localhost:5173/auth/callback?accessToken=" + accessToken + "&refreshToken=" + refreshToken;
        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }
}
