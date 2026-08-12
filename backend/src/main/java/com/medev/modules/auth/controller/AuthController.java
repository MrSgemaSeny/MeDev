package com.medev.modules.auth.controller;

import com.medev.modules.auth.dto.AuthResponse;
import com.medev.modules.auth.dto.LoginRequest;
import com.medev.modules.auth.dto.RefreshRequest;
import com.medev.modules.auth.dto.RegisterRequest;
import com.medev.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final com.medev.modules.auth.service.AuthRateLimiter authRateLimiter;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken()));
    }

    @PostMapping("/oauth2/exchange")
    public ResponseEntity<AuthResponse> exchangeOauth2(@RequestBody com.medev.modules.auth.dto.OAuth2ExchangeRequest request) {
        return ResponseEntity.ok(authService.exchangeOauth2Code(request.getCode()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.noContent().build();
    }

    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        // Prevent X-Forwarded-For spoofing by relying on the remote address.
        // If behind a trusted proxy (e.g. Fly.io), Spring Boot should be configured 
        // to trust it via server.forward-headers-strategy=FRAMEWORK, making getRemoteAddr safe.
        return request.getRemoteAddr();
    }
}
