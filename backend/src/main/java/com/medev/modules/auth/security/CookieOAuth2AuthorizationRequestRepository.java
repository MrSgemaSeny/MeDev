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

        boolean isHttps = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        String serialized = serialize(authorizationRequest);
        org.springframework.http.ResponseCookie authCookie = org.springframework.http.ResponseCookie
                .from(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, serialized)
                .path("/")
                .httpOnly(true)
                .maxAge(COOKIE_EXPIRE_SECONDS)
                .secure(isHttps)
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, authCookie.toString());

        String redirectUriAfterLogin = request.getParameter(REDIRECT_URI_PARAM_COOKIE_NAME);
        if (redirectUriAfterLogin != null && !redirectUriAfterLogin.isBlank()) {
            org.springframework.http.ResponseCookie redirectCookie = org.springframework.http.ResponseCookie
                    .from(REDIRECT_URI_PARAM_COOKIE_NAME, redirectUriAfterLogin.trim())
                    .path("/")
                    .httpOnly(true)
                    .maxAge(COOKIE_EXPIRE_SECONDS)
                    .secure(isHttps)
                    .sameSite("Lax")
                    .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, redirectCookie.toString());
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = loadAuthorizationRequest(request);
        removeAuthorizationRequestCookies(request, response);
        return authRequest;
    }

    public void removeAuthorizationRequestCookies(HttpServletRequest request, HttpServletResponse response) {
        boolean isHttps = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        for (String name : new String[]{OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, REDIRECT_URI_PARAM_COOKIE_NAME}) {
            fetchCookie(request, name).ifPresent(cookie -> {
                org.springframework.http.ResponseCookie clearCookie = org.springframework.http.ResponseCookie
                        .from(name, "")
                        .path("/")
                        .httpOnly(true)
                        .maxAge(0)
                        .secure(isHttps)
                        .sameSite("Lax")
                        .build();
                response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, clearCookie.toString());
            });
        }
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
