package com.medev.modules.ai.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.TooManyRequestsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRateLimiter {

    private static final int FREE_DAILY_LIMIT = 10;
    private static final int PRO_DAILY_LIMIT  = 100;

    private static final String CONSUME_LUA_SCRIPT =
            "local key = KEYS[1]\n" +
            "local limit = tonumber(ARGV[1])\n" +
            "local ttl = tonumber(ARGV[2])\n" +
            "local current = tonumber(redis.call('get', key) or '0')\n" +
            "if current >= limit then\n" +
            "    return -1\n" +
            "end\n" +
            "local newVal = redis.call('incr', key)\n" +
            "if redis.call('ttl', key) < 0 then\n" +
            "    redis.call('expire', key, ttl)\n" +
            "end\n" +
            "return newVal\n";

    private final RedisScript<Long> consumeScript = new DefaultRedisScript<>(CONSUME_LUA_SCRIPT, Long.class);

    private final UserRepository userRepository;
    private final StringRedisTemplate stringRedisTemplate;

    public void checkAndConsume(Long userId) {
        int limit = getUserDailyLimit(userId);
        String key = getRedisKey(userId);
        long ttlSeconds = calculateTtlSecondsUntilMidnight();

        Long result = stringRedisTemplate.execute(
                consumeScript,
                Collections.singletonList(key),
                String.valueOf(limit),
                String.valueOf(ttlSeconds)
        );

        if (result == null || result < 0) {
            log.warn("[AiRateLimiter] User {} exceeded daily AI limit ({})", userId, limit);
            throw new TooManyRequestsException(
                    "Вы достигли дневного лимита AI-запросов (" + limit + "). " +
                    "Лимит обновится завтра."
            );
        }

        log.debug("[AiRateLimiter] User {} consumed 1 token, current count: {}, limit: {}",
                userId, result, limit);
    }

    public long getRemainingRequests(Long userId) {
        int limit = getUserDailyLimit(userId);
        String key = getRedisKey(userId);
        String currentStr = stringRedisTemplate.opsForValue().get(key);
        if (currentStr == null) return limit;
        int current = Integer.parseInt(currentStr);
        return Math.max(0, limit - current);
    }

    public int getDailyLimit(Long userId) {
        return getUserDailyLimit(userId);
    }

    public void evictUserPlan(Long userId) {
        if (userId != null) {
            stringRedisTemplate.delete("user_plan:" + userId);
            log.debug("[AiRateLimiter] Evicted plan cache for user {}", userId);
        }
    }

    private String getRedisKey(Long userId) {
        return "ai_limit:" + userId + ":" + LocalDate.now();
    }

    private long calculateTtlSecondsUntilMidnight() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime midnight = LocalDate.now().plusDays(1).atStartOfDay();
        long seconds = Duration.between(now, midnight).getSeconds();
        return seconds > 0 ? seconds : 86400L;
    }

    private int getUserDailyLimit(Long userId) {
        String planKey = "user_plan:" + userId;
        String planStr = stringRedisTemplate.opsForValue().get(planKey);

        if (planStr == null) {
            User user = userRepository.findById(userId).orElse(null);
            Duration ttl = Duration.ofMinutes(15);
            if (user != null) {
                if (user.getPlan() == User.Plan.PRO) {
                    if (user.getSubscriptionExpiresAt() != null) {
                        LocalDateTime now = LocalDateTime.now();
                        if (user.getSubscriptionExpiresAt().isBefore(now)) {
                            planStr = "FREE";
                            ttl = Duration.ofMinutes(15);
                        } else {
                            planStr = "PRO";
                            Duration untilExpiry = Duration.between(now, user.getSubscriptionExpiresAt());
                            if (untilExpiry.compareTo(Duration.ofMinutes(15)) < 0 && !untilExpiry.isNegative()) {
                                ttl = untilExpiry;
                            } else {
                                ttl = Duration.ofMinutes(15);
                            }
                            if (ttl.isZero() || ttl.isNegative()) {
                                ttl = Duration.ofSeconds(1);
                            }
                        }
                    } else {
                        planStr = "PRO";
                    }
                } else {
                    planStr = user.getPlan() != null ? user.getPlan().name() : "FREE";
                }
            } else {
                planStr = "FREE";
            }
            stringRedisTemplate.opsForValue().set(planKey, planStr, ttl);
        }

        return "PRO".equals(planStr) ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
    }
}
