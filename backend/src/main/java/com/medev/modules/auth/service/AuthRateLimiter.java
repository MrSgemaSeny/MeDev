package com.medev.modules.auth.service;

import com.medev.shared.exception.TooManyRequestsException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class AuthRateLimiter {

    // 20 requests per minute per IP for auth endpoints
    private static final int REQUESTS_PER_MINUTE = 20;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public void checkAndConsume(String clientIp) {
        Bucket bucket = buckets.computeIfAbsent(clientIp, this::createBucket);

        if (!bucket.tryConsume(1)) {
            log.warn("[AuthRateLimiter] Rate limit exceeded for IP: {}", clientIp);
            throw new TooManyRequestsException(
                    "Слишком много попыток входа/регистрации. Пожалуйста, подождите 1 минуту."
            );
        }
    }

    private Bucket createBucket(String clientIp) {
        Bandwidth bandwidth = Bandwidth.classic(
                REQUESTS_PER_MINUTE,
                Refill.intervally(REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
        );
        return Bucket.builder().addLimit(bandwidth).build();
    }
}
