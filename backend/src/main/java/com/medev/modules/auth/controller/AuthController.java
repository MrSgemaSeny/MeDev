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

    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

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

    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(@Valid @RequestBody com.medev.modules.auth.dto.ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        authService.forgotPassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", "If an account with that email exists, password reset instructions have been dispatched."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@Valid @RequestBody com.medev.modules.auth.dto.ResetPasswordRequest request, HttpServletRequest httpRequest) {
        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        authService.resetPassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Password has been reset successfully."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = "refresh_token", required = false) String refreshToken, HttpServletRequest httpRequest, HttpServletResponse response) {
        validateCsrf(httpRequest);
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
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String token, HttpServletRequest httpRequest, HttpServletResponse response) {
        validateCsrf(httpRequest);
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

        ResponseCookie linkCookie = ResponseCookie.from("medev_link_jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .secure(true)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, linkCookie.toString());

        return ResponseEntity.noContent().build();
    }

    private void validateCsrf(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin == null || origin.isBlank()) {
            String referer = request.getHeader("Referer");
            if (referer != null && !referer.isBlank()) {
                try {
                    java.net.URI uri = java.net.URI.create(referer);
                    origin = uri.getScheme() + "://" + uri.getAuthority();
                } catch (Exception ignored) {}
            }
        }
        if (origin == null || origin.isBlank()) {
            return;
        }

        if (!com.medev.shared.security.SecurityOrigins.isAllowedOrigin(origin, allowedOrigins)) {
            throw new com.medev.shared.exception.ForbiddenException("Cross-origin request rejected");
        }
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
        String ip = request.getRemoteAddr();
        String xff = request.getHeader("X-Forwarded-For");
        org.slf4j.LoggerFactory.getLogger(AuthController.class).debug("[IP] remoteAddr={}, X-Forwarded-For={}", ip, xff);

        // If request is from loopback or internal private network (Render/Fly.io/Docker),
        // extract the rightmost client IP appended by the trusted reverse proxy.
        if (isPrivateOrLoopback(ip) && xff != null && !xff.isBlank()) {
            String[] parts = xff.split(",");
            return parts[parts.length - 1].trim();
        }
        return ip != null && !ip.isBlank() ? ip : "127.0.0.1";
    }

    private static boolean isPrivateOrLoopback(String ip) {
        if (ip == null || ip.isBlank()) return true;
        return ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1")
                || ip.startsWith("10.") || ip.startsWith("192.168.")
                || ip.matches("^172\\.(1[6-9]|2[0-9]|3[0-1])\\..*");
    }
}
