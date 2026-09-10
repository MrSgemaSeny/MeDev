package com.medev.modules.ai.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.TooManyRequestsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRateLimiter {

    private static final int FREE_DAILY_LIMIT = 10;
    private static final int PRO_DAILY_LIMIT  = 100;

    private final UserRepository userRepository;
    private final org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    public void checkAndConsume(Long userId) {
        int limit = getUserDailyLimit(userId);
        String key = getRedisKey(userId);
        
        Long current = stringRedisTemplate.opsForValue().increment(key);
        if (current != null && current == 1L) {
            stringRedisTemplate.expire(key, Duration.ofDays(1));
        } else if (current != null) {
            Long expire = stringRedisTemplate.getExpire(key);
            if (expire != null && expire == -1L) {
                stringRedisTemplate.expire(key, Duration.ofDays(1));
            }
        }

        if (current != null && current > limit) {
            log.warn("[AiRateLimiter] User {} exceeded daily AI limit ({})", userId, limit);
            throw new TooManyRequestsException(
                    "Вы достигли дневного лимита AI-запросов (" + limit + "). " +
                    "Лимит обновится завтра."
            );
        }

        log.debug("[AiRateLimiter] User {} consumed 1 token, remaining: {}",
                userId, limit - (current != null ? current : 0));
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

    private String getRedisKey(Long userId) {
        return "ai_limit:" + userId + ":" + LocalDate.now();
    }

    private int getUserDailyLimit(Long userId) {
        String planKey = "user_plan:" + userId;
        String planStr = stringRedisTemplate.opsForValue().get(planKey);
        
        if (planStr == null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                boolean isExpired = user.getPlan() == User.Plan.PRO && user.getSubscriptionExpiresAt() != null 
                        && user.getSubscriptionExpiresAt().isBefore(java.time.LocalDateTime.now());
                if (isExpired) {
                    planStr = "FREE";
                } else {
                    planStr = user.getPlan() != null ? user.getPlan().name() : "FREE";
                }
            } else {
                planStr = "FREE";
            }
            stringRedisTemplate.opsForValue().set(planKey, planStr, Duration.ofMinutes(15));
        }
        
        return "PRO".equals(planStr) ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
    }
}
