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
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        // _email is set by CustomOAuth2UserService for all providers
        String email = (String) oAuth2User.getAttributes().get("_email");
        if (email == null) {
            // Fallback: try standard email attribute
            email = (String) oAuth2User.getAttributes().get("email");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after OAuth2 login"));

        String deviceId = UUID.randomUUID().toString();
        String oauth2Code = UUID.randomUUID().toString();
        
        // Store user ID in Redis under the oauth2 code
        redisTemplate.opsForValue().set(
            "oauth2_code:" + oauth2Code,
            user.getId().toString(),
            Duration.ofMinutes(5)
        );

        String frontendOrigin = allowedOrigins.split(",")[0];
        String frontendUrl = frontendOrigin + "/auth/callback?code=" + oauth2Code;
        
        String action = (String) oAuth2User.getAttributes().get("_action");
        if ("LINK_ACCOUNT".equals(action)) {
            jakarta.servlet.http.Cookie linkCookie = new jakarta.servlet.http.Cookie("medev_link_jwt", "");
            linkCookie.setPath("/");
            linkCookie.setMaxAge(0);
            linkCookie.setHttpOnly(true);
            linkCookie.setSecure(true);
            response.addCookie(linkCookie);
            
            frontendUrl = frontendOrigin + "/profile/edit?github_linked=true&code=" + oauth2Code;
        }

        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }
}
