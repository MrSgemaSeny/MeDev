package com.medev.modules.ai.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.TooManyRequestsException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting по userId с учётом плана (FREE / PRO).
 *
 * FREE: 10 AI-запросов в сутки
 * PRO:  100 AI-запросов в сутки
 *
 * Почему не по IP:
 * - IP легко обходится через VPN
 * - Один IP может быть у офиса/университета (много пользователей)
 * - Нам важно ограничить стоимость на пользователя, а не на IP
 *
 * Хранение в памяти — достаточно для MVP (single instance).
 * При масштабировании заменить на Redis + Bucket4j RedisProxyManager.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiRateLimiter {

    private static final int FREE_DAILY_LIMIT = 10;
    private static final int PRO_DAILY_LIMIT  = 100;

    private final UserRepository userRepository;

    // userId → bucket
    private final Map<Long, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * Проверяет лимит и списывает 1 токен.
     * Бросает TooManyRequestsException если лимит исчерпан.
     *
     * @param userId текущий пользователь
     */
    public void checkAndConsume(Long userId) {
        Bucket bucket = buckets.computeIfAbsent(userId, this::createBucket);

        if (!bucket.tryConsume(1)) {
            int limit = getUserDailyLimit(userId);
            log.warn("[AiRateLimiter] User {} exceeded daily AI limit ({})", userId, limit);
            throw new TooManyRequestsException(
                    "Вы достигли дневного лимита AI-запросов (" + limit + "). " +
                    "Лимит обновится завтра."
            );
        }

        log.debug("[AiRateLimiter] User {} consumed 1 token, remaining: {}",
                userId, bucket.getAvailableTokens());
    }

    /**
     * Сколько запросов осталось у пользователя сегодня.
     */
    public long getRemainingRequests(Long userId) {
        Bucket bucket = buckets.computeIfAbsent(userId, this::createBucket);
        return bucket.getAvailableTokens();
    }

    /**
     * Сколько запросов доступно пользователю в день.
     */
    public int getDailyLimit(Long userId) {
        return getUserDailyLimit(userId);
    }

    // ─────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────

    private Bucket createBucket(Long userId) {
        int limit = getUserDailyLimit(userId);
        // Refill.intervally — обновляется раз в сутки пакетом, не по чуть-чуть
        Bandwidth bandwidth = Bandwidth.classic(limit, Refill.intervally(limit, Duration.ofDays(1)));
        return Bucket.builder().addLimit(bandwidth).build();
    }

    private int getUserDailyLimit(Long userId) {
        return userRepository.findById(userId)
                .map(User::getPlan)
                .map(plan -> switch (plan) {
                    case PRO -> PRO_DAILY_LIMIT;
                    default  -> FREE_DAILY_LIMIT;
                })
                .orElse(FREE_DAILY_LIMIT);
    }
}
