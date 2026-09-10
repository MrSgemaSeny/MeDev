package com.medev.shared.security;

import java.util.List;
import java.util.Set;

public final class SecurityOrigins {

    private SecurityOrigins() {}

    public static final Set<String> DEFAULT_ALLOWED_ORIGINS = Set.of(
            "https://app.medev.mrsgemaseny.com",
            "https://medev.mrsgemaseny.com",
            "https://me-dev-two.vercel.app",
            "https://mrsgemaseny.github.io",
            "http://localhost:5173",
            "http://localhost:3000",
            "capacitor://localhost",
            "http://localhost",
            "https://localhost"
    );

    public static final List<String> DEFAULT_PATTERN_ORIGINS = List.of(
            "https://*.mrsgemaseny.com",
            "https://*.vercel.app"
    );

    public static boolean isAllowedOrigin(String origin, String additionalAllowed) {
        if (origin == null || origin.isBlank()) return false;
        String clean = origin.trim().toLowerCase();
        if (DEFAULT_ALLOWED_ORIGINS.contains(clean) ||
                clean.endsWith(".mrsgemaseny.com") ||
                clean.endsWith(".vercel.app") ||
                clean.startsWith("http://localhost:") ||
                clean.startsWith("http://127.0.0.1:")) {
            return true;
        }
        if (additionalAllowed != null && !additionalAllowed.isBlank()) {
            for (String allowed : additionalAllowed.split(",")) {
                String cleanAllowed = allowed.trim().toLowerCase();
                if (cleanAllowed.equals("*") || cleanAllowed.equals(clean)) {
                    return true;
                }
                if (cleanAllowed.startsWith("*.") && clean.endsWith(cleanAllowed.substring(1))) {
                    return true;
                }
            }
        }
        return false;
    }
}
