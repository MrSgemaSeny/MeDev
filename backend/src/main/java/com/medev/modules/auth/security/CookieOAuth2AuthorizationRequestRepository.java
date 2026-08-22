package com.medev.modules.auth.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

import java.util.Base64;

@Component
public class CookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME = "oauth2_auth_request";
    public static final String REDIRECT_URI_PARAM_COOKIE_NAME = "redirect_uri";
    private static final int COOKIE_EXPIRE_SECONDS = 180;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return fetchCookie(request, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME)
                .map(cookie -> deserialize(cookie.getValue()))
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeAuthorizationRequestCookies(request, response);
            return;
        }

        String serialized = serialize(authorizationRequest);
        Cookie cookie = new Cookie(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, serialized);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(COOKIE_EXPIRE_SECONDS);
        cookie.setSecure(request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto")));
        response.addCookie(cookie);

        String redirectUriAfterLogin = request.getParameter(REDIRECT_URI_PARAM_COOKIE_NAME);
        if (redirectUriAfterLogin != null && !redirectUriAfterLogin.isBlank()) {
            Cookie redirectCookie = new Cookie(REDIRECT_URI_PARAM_COOKIE_NAME, redirectUriAfterLogin.trim());
            redirectCookie.setPath("/");
            redirectCookie.setHttpOnly(true);
            redirectCookie.setMaxAge(COOKIE_EXPIRE_SECONDS);
            redirectCookie.setSecure(request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto")));
            response.addCookie(redirectCookie);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = loadAuthorizationRequest(request);
        removeAuthorizationRequestCookies(request, response);
        return authRequest;
    }

    public void removeAuthorizationRequestCookies(HttpServletRequest request, HttpServletResponse response) {
        fetchCookie(request, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME).ifPresent(cookie -> {
            cookie.setValue("");
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);
        });
        fetchCookie(request, REDIRECT_URI_PARAM_COOKIE_NAME).ifPresent(cookie -> {
            cookie.setValue("");
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);
        });
    }

    private String serialize(OAuth2AuthorizationRequest authorizationRequest) {
        try {
            byte[] bytes = org.springframework.util.SerializationUtils.serialize(authorizationRequest);
            return Base64.getUrlEncoder().encodeToString(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize OAuth2AuthorizationRequest", e);
        }
    }

    private OAuth2AuthorizationRequest deserialize(String cookieValue) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(cookieValue);
            Object obj = org.springframework.util.SerializationUtils.deserialize(bytes);
            return (OAuth2AuthorizationRequest) obj;
        } catch (Exception e) {
            return null;
        }
    }

    private java.util.Optional<Cookie> fetchCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return java.util.Optional.of(cookie);
                }
            }
        }
        return java.util.Optional.empty();
    }
}
