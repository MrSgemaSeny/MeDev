package com.medev.shared.security;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUtils {
    public static Long getCurrentUserId() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new IllegalStateException("User not authenticated");
        }
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        if (principal instanceof UserDetails userDetails) {
            try {
                return Long.parseLong(userDetails.getUsername());
            } catch (NumberFormatException ignored) {
            }
        }
        if (principal instanceof String str) {
            try {
                return Long.parseLong(str);
            } catch (NumberFormatException ignored) {
            }
        }
        throw new IllegalStateException("User not authenticated or invalid principal type");
    }
}
