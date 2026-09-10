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

    private static final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    private String serialize(OAuth2AuthorizationRequest authorizationRequest) {
        try {
            OAuth2RequestDto dto = new OAuth2RequestDto();
            dto.authorizationUri = authorizationRequest.getAuthorizationUri();
            dto.grantType = authorizationRequest.getGrantType().getValue();
            dto.responseType = authorizationRequest.getResponseType().getValue();
            dto.clientId = authorizationRequest.getClientId();
            dto.redirectUri = authorizationRequest.getRedirectUri();
            dto.scopes = authorizationRequest.getScopes();
            dto.state = authorizationRequest.getState();
            dto.additionalParameters = authorizationRequest.getAdditionalParameters();
            dto.attributes = authorizationRequest.getAttributes();
            dto.authorizationRequestUri = authorizationRequest.getAuthorizationRequestUri();
            
            String json = objectMapper.writeValueAsString(dto);
            return com.medev.shared.security.EncryptionUtils.encrypt(json);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize OAuth2AuthorizationRequest", e);
        }
    }

    private OAuth2AuthorizationRequest deserialize(String cookieValue) {
        try {
            String json = com.medev.shared.security.EncryptionUtils.decrypt(cookieValue);
            OAuth2RequestDto dto = objectMapper.readValue(json, OAuth2RequestDto.class);
            
            return OAuth2AuthorizationRequest.authorizationCode()
                    .authorizationUri(dto.authorizationUri)
                    .clientId(dto.clientId)
                    .redirectUri(dto.redirectUri)
                    .scopes(dto.scopes)
                    .state(dto.state)
                    .additionalParameters(dto.additionalParameters)
                    .attributes(dto.attributes)
                    .build();
        } catch (Exception e) {
            return null;
        }
    }

    private static class OAuth2RequestDto {
        public String authorizationUri;
        public String grantType;
        public String responseType;
        public String clientId;
        public String redirectUri;
        public java.util.Set<String> scopes;
        public String state;
        public java.util.Map<String, Object> additionalParameters;
        public java.util.Map<String, Object> attributes;
        public String authorizationRequestUri;
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
