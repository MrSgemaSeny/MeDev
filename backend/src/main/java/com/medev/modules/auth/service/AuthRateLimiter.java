package com.medev.modules.auth.service;

import com.medev.shared.exception.TooManyRequestsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthRateLimiter {

    // 20 requests per minute per IP for auth endpoints
    private static final int REQUESTS_PER_MINUTE = 20;

    private final RedisTemplate<String, Object> redisTemplate;

    public void checkAndConsume(String clientIp) {
        String key = "rate:auth:" + clientIp;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }

        if (count != null && count > REQUESTS_PER_MINUTE) {
            log.warn("[AuthRateLimiter] Rate limit exceeded for IP: {}", clientIp);
            throw new TooManyRequestsException(
                    "Слишком много попыток входа/регистрации. Пожалуйста, подождите 1 минуту."
            );
        }
    }
}
