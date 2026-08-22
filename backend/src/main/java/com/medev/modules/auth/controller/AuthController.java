package com.medev.modules.auth.controller;

import com.medev.modules.auth.dto.AuthResponse;
import com.medev.modules.auth.dto.LoginRequest;
import com.medev.modules.auth.dto.RefreshRequest;
import com.medev.modules.auth.dto.RegisterRequest;
import com.medev.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final com.medev.modules.auth.service.AuthRateLimiter authRateLimiter;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest, HttpServletResponse response) {
        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        AuthResponse res = authService.register(request);
        setRefreshTokenCookie(response, res.getRefreshToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response) {
        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        AuthResponse res = authService.login(request);
        setRefreshTokenCookie(response, res.getRefreshToken());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = "refresh_token", required = false) String refreshToken, HttpServletRequest httpRequest, HttpServletResponse response) {
        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AuthResponse res = authService.refresh(refreshToken);
        setRefreshTokenCookie(response, res.getRefreshToken());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/oauth2/exchange")
    public ResponseEntity<AuthResponse> exchangeOauth2(@RequestBody com.medev.modules.auth.dto.OAuth2ExchangeRequest request, HttpServletResponse response) {
        AuthResponse res = authService.exchangeOauth2Code(request.getCode());
        setRefreshTokenCookie(response, res.getRefreshToken());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/oauth2/link/{provider}")
    public void linkOauth2(@PathVariable String provider, @RequestParam(value = "token", required = false) String token, HttpServletResponse response) throws java.io.IOException {
        if (token == null || token.isBlank()) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Missing token");
            return;
        }
        ResponseCookie linkCookie = ResponseCookie.from("medev_link_jwt", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(300) // 5 minutes
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, linkCookie.toString());
        response.sendRedirect("/api/oauth2/authorization/" + provider);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String token, HttpServletResponse response) {
        if (token != null && !token.isBlank()) {
            authService.logout(token);
        }
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .secure(true)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        if (refreshToken == null) return;
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(30 * 24 * 60 * 60) // 30 days
                .sameSite("None")
                .secure(true)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getClientIp(HttpServletRequest request) {
        // Prevent X-Forwarded-For spoofing by relying on the remote address.
        // If behind a trusted proxy (e.g. Fly.io), Spring Boot should be configured 
        // to trust it via server.forward-headers-strategy=FRAMEWORK, making getRemoteAddr safe.
        return request.getRemoteAddr();
    }
}
