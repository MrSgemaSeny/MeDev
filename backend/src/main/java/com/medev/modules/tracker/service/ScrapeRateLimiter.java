package com.medev.modules.tracker.service;

import com.medev.shared.exception.TooManyRequestsException;
import com.medev.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.time.Duration;

/**
 * SRP component for enforcing rate limits on web scraping operations
 * per user and per target domain.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ScrapeRateLimiter {

    private final StringRedisTemplate stringRedisTemplate;

    private static final int MAX_USER_SCRAPES_PER_MINUTE = 20;
    private static final int MAX_DOMAIN_SCRAPES_PER_MINUTE = 60;

    /**
     * Enforces rate limiting per authenticated user and optionally per target domain.
     *
     * @param targetUrl The URL being scraped
     */
    public void checkRateLimit(String targetUrl) {
        if (stringRedisTemplate == null) {
            return;
        }

        var ops = stringRedisTemplate.opsForValue();
        if (ops == null) {
            return;
        }

        try {
            Long userId = null;
            try {
                userId = SecurityUtils.getCurrentUserId();
            } catch (Exception ignored) {
                // Not authenticated or in a test/system context
            }
            if (userId != null) {
                String userKey = "rate:scrape:user:" + userId;
                Long userCount = ops.increment(userKey);
                if (userCount != null && userCount == 1L) {
                    stringRedisTemplate.expire(userKey, Duration.ofMinutes(1));
                }
                if (userCount != null && userCount > MAX_USER_SCRAPES_PER_MINUTE) {
                    throw new TooManyRequestsException("Слишком много запросов на парсинг. Пожалуйста, подождите минуту.");
                }
            }

            if (targetUrl != null && !targetUrl.isBlank()) {
                String domain = extractDomain(targetUrl);
                if (domain != null && !domain.isBlank()) {
                    String domainKey = "rate:scrape:domain:" + domain;
                    Long domainCount = ops.increment(domainKey);
                    if (domainCount != null && domainCount == 1L) {
                        stringRedisTemplate.expire(domainKey, Duration.ofMinutes(1));
                    }
                    if (domainCount != null && domainCount > MAX_DOMAIN_SCRAPES_PER_MINUTE) {
                        throw new TooManyRequestsException("Превышен лимит запросов к домену " + domain + ". Пожалуйста, подождите минуту.");
                    }
                }
            }
        } catch (TooManyRequestsException e) {
            throw e;
        } catch (DataAccessException e) {
            log.warn("Rate limit check skipped due to Redis error: {}", e.getMessage());
        }
    }

    String extractDomain(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        try {
            String candidate = url.trim();
            if (!candidate.contains("://")) {
                candidate = "https://" + candidate;
            }
            URI uri = URI.create(candidate);
            String host = uri.getHost();
            return host != null ? host.toLowerCase() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
