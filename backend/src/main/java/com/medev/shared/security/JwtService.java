package com.medev.shared.security;

import com.medev.modules.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import jakarta.annotation.PostConstruct;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @PostConstruct
    void validateSecret() {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT secret must be at least 256 bits (32 bytes)");
        }
    }

    @Value("${jwt.expiration}")
    private long expiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user, String deviceId) {
        return buildToken(user, deviceId, expiration, "access");
    }

    public String generateRefreshToken(User user, String deviceId) {
        return buildToken(user, deviceId, refreshExpiration, "refresh");
    }

    private String buildToken(User user, String deviceId, long exp, String type) {
        return Jwts.builder()
                .subject(user.getEmail())
                .issuer("MeDev")
                .audience().add("MeDev-Clients").and()
                .claim("userId", user.getId())
                .claim("deviceId", deviceId)
                .claim("role", user.getRole().name())
                .claim("plan", user.getPlan().name())
                .claim("type", type)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + exp))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    public String extractDeviceId(String token) {
        return getClaims(token).get("deviceId", String.class);
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public String extractType(String token) {
        return getClaims(token).get("type", String.class);
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .requireIssuer("MeDev")
                .requireAudience("MeDev-Clients")
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
