package com.medev.modules.auth.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final CookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        log.warn("OAuth2 authentication failed or cancelled: {}", exception != null ? exception.getMessage() : "Unknown");

        String targetOrigin = allowedOrigins.split(",")[0].trim();
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("redirect_uri".equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    String candidate = cookie.getValue().trim();
                    for (String allowed : allowedOrigins.split(",")) {
                        String cleanAllowed = allowed.trim();
                        if (!cleanAllowed.isEmpty() && (candidate.equalsIgnoreCase(cleanAllowed) || candidate.startsWith(cleanAllowed + "/") || cleanAllowed.equals("*"))) {
                            targetOrigin = cleanAllowed.equals("*") ? candidate : cleanAllowed;
                            break;
                        }
                    }
                }
            }
        }

        cookieRepository.removeAuthorizationRequestCookies(request, response);

        String errorReason = exception != null && exception.getMessage() != null ? exception.getMessage() : "OAuth authentication cancelled";
        String frontendUrl = targetOrigin + "/login?oauth_error=" + URLEncoder.encode(errorReason, StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }
}
