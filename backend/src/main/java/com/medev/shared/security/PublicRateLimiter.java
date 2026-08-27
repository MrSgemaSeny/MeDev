package com.medev.shared.security;

import com.medev.shared.exception.TooManyRequestsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * IP-based rate limiter для публичных (не-авторизованных) эндпоинтов.
 *
 * Использование: вызывать в контроллере, передавая IP из X-Forwarded-For / RemoteAddr.
 * Лимит: 60 запросов в минуту на IP — достаточно для честного браузера,
 * убивает простой HTTP-флуд до того как он доберётся до Caffeine/HikariCP.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PublicRateLimiter {

    private static final int REQUESTS_PER_MINUTE = 60;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final RedisTemplate<String, Object> redisTemplate;

    public void checkAndConsume(String clientIp, String endpoint) {
        String key = "rate:public:" + endpoint + ":" + clientIp;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redisTemplate.expire(key, WINDOW);
        }

        if (count != null && count > REQUESTS_PER_MINUTE) {
            log.warn("[PublicRateLimiter] IP {} exceeded public rate limit on {}", clientIp, endpoint);
            throw new TooManyRequestsException(
                    "Слишком много запросов. Пожалуйста, подождите немного."
            );
        }
    }
}
