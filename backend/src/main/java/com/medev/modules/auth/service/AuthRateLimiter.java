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
        String luaScript = 
            "local count = redis.call('incr', KEYS[1])\n" +
            "if count == 1 then\n" +
            "  redis.call('expire', KEYS[1], ARGV[1])\n" +
            "end\n" +
            "return count";
            
        org.springframework.data.redis.core.script.DefaultRedisScript<Long> script = 
            new org.springframework.data.redis.core.script.DefaultRedisScript<>();
        script.setScriptText(luaScript);
        script.setResultType(Long.class);

        Long count = redisTemplate.execute(script, java.util.Collections.singletonList(key), "60");

        if (count != null && count > REQUESTS_PER_MINUTE) {
            log.warn("[AuthRateLimiter] Rate limit exceeded for IP: {}", clientIp);
            throw new TooManyRequestsException(
                    "Слишком много попыток входа/регистрации. Пожалуйста, подождите 1 минуту."
            );
        }
    }
}
