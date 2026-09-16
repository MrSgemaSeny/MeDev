package com.medev.modules.ai.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.TooManyRequestsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.RedisScript;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AiRateLimiterAdversarialTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AiRateLimiter rateLimiter;

    private final Map<String, Long> redisStore = new ConcurrentHashMap<>();
    private final Map<String, Long> redisTtlStore = new ConcurrentHashMap<>();
    private final Object redisLock = new Object();

    @BeforeEach
    void setUp() {
        lenient().when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        redisStore.clear();
        redisTtlStore.clear();

        // Exact simulation of Redis single-threaded atomic Lua script execution
        lenient().when(stringRedisTemplate.execute(any(RedisScript.class), anyList(), anyString(), anyString()))
                .thenAnswer(invocation -> {
                    List<String> keys = invocation.getArgument(1);
                    String key = keys.get(0);
                    long limit = Long.parseLong(invocation.getArgument(2));
                    long ttl = Long.parseLong(invocation.getArgument(3));

                    synchronized (redisLock) {
                        long current = redisStore.getOrDefault(key, 0L);
                        if (current >= limit) {
                            return -1L;
                        }
                        long newVal = current + 1;
                        redisStore.put(key, newVal);
                        long currentTtl = redisTtlStore.getOrDefault(key, -1L);
                        if (currentTtl < 0) {
                            redisTtlStore.put(key, ttl);
                        }
                        return newVal;
                    }
                });
    }

    @Test
    @DisplayName("Adversarial: 50 concurrent requests when 1 credit remains — counter never exceeds limit")
    void test50ConcurrentRequestsWhen1CreditRemains_counterNeverExceedsLimit() throws InterruptedException {
        Long userId = 1L;
        String planKey = "user_plan:" + userId;
        String limitKey = "ai_limit:" + userId + ":" + LocalDate.now();

        // User is on FREE plan (limit = 10)
        when(valueOperations.get(planKey)).thenReturn("FREE");

        // Exactly 9 credits consumed previously, so exactly 1 credit remains
        redisStore.put(limitKey, 9L);
        redisTtlStore.put(limitKey, 3600L);

        int concurrentThreads = 50;
        ExecutorService executor = Executors.newFixedThreadPool(concurrentThreads);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch endGate = new CountDownLatch(concurrentThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);

        for (int i = 0; i < concurrentThreads; i++) {
            executor.submit(() -> {
                try {
                    startGate.await();
                    rateLimiter.checkAndConsume(userId);
                    successCount.incrementAndGet();
                } catch (TooManyRequestsException e) {
                    rejectedCount.incrementAndGet();
                } catch (Exception ignored) {
                } finally {
                    endGate.countDown();
                }
            });
        }

        startGate.countDown();
        boolean completed = endGate.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).isTrue();
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(rejectedCount.get()).isEqualTo(49);
        assertThat(redisStore.get(limitKey)).isEqualTo(10L);
    }

    @Test
    @DisplayName("Adversarial: 50 concurrent requests with initial limit=1 — counter never exceeds 1")
    void test50ConcurrentRequestsWithInitialLimit1_counterNeverExceeds1() throws InterruptedException {
        Long userId = 2L;
        String planKey = "user_plan:" + userId;
        String limitKey = "ai_limit:" + userId + ":" + LocalDate.now();

        when(valueOperations.get(planKey)).thenReturn("FREE");

        // Custom script behavior simulating limit = 1
        when(stringRedisTemplate.execute(any(RedisScript.class), anyList(), anyString(), anyString()))
                .thenAnswer(invocation -> {
                    List<String> keys = invocation.getArgument(1);
                    String key = keys.get(0);
                    long limit = 1L; // Adversarial: tightest quota boundary
                    long ttl = Long.parseLong(invocation.getArgument(3));

                    synchronized (redisLock) {
                        long current = redisStore.getOrDefault(key, 0L);
                        if (current >= limit) {
                            return -1L;
                        }
                        long newVal = current + 1;
                        redisStore.put(key, newVal);
                        long currentTtl = redisTtlStore.getOrDefault(key, -1L);
                        if (currentTtl < 0) {
                            redisTtlStore.put(key, ttl);
                        }
                        return newVal;
                    }
                });

        int concurrentThreads = 50;
        ExecutorService executor = Executors.newFixedThreadPool(concurrentThreads);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch endGate = new CountDownLatch(concurrentThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);

        for (int i = 0; i < concurrentThreads; i++) {
            executor.submit(() -> {
                try {
                    startGate.await();
                    rateLimiter.checkAndConsume(userId);
                    successCount.incrementAndGet();
                } catch (TooManyRequestsException e) {
                    rejectedCount.incrementAndGet();
                } catch (Exception ignored) {
                } finally {
                    endGate.countDown();
                }
            });
        }

        startGate.countDown();
        endGate.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(rejectedCount.get()).isEqualTo(49);
        assertThat(redisStore.get(limitKey)).isEqualTo(1L);
    }

    @Test
    @DisplayName("TTL behavior: key creation sets TTL until midnight; subsequent hits preserve original TTL")
    void testTTLBehavior_firstCreatedVersusSubsequentIncrements() {
        Long userId = 3L;
        String limitKey = "ai_limit:" + userId + ":" + LocalDate.now();
        when(valueOperations.get("user_plan:3")).thenReturn("FREE");

        // 1. Initial request when key does not exist
        assertThat(redisTtlStore.get(limitKey)).isNull();
        rateLimiter.checkAndConsume(userId);

        assertThat(redisStore.get(limitKey)).isEqualTo(1L);
        assertThat(redisTtlStore.get(limitKey)).isNotNull();
        long initialTtl = redisTtlStore.get(limitKey);
        assertThat(initialTtl).isGreaterThan(0);

        // 2. Simulate passage of time where TTL has decreased to 1800 seconds
        redisTtlStore.put(limitKey, 1800L);

        // 3. Second request must preserve 1800s and NOT overwrite it with a new 24h TTL
        rateLimiter.checkAndConsume(userId);
        assertThat(redisStore.get(limitKey)).isEqualTo(2L);
        assertThat(redisTtlStore.get(limitKey)).isEqualTo(1800L);
    }

    @Test
    @DisplayName("Boundary: exhausted or corrupted counter above limit rejects and never increments")
    void testBoundary_counterAlreadyAboveLimit_rejectsWithoutIncrement() {
        Long userId = 4L;
        String limitKey = "ai_limit:" + userId + ":" + LocalDate.now();
        when(valueOperations.get("user_plan:4")).thenReturn("FREE");

        // Pre-set to 15 (limit is 10)
        redisStore.put(limitKey, 15L);

        assertThatThrownBy(() -> rateLimiter.checkAndConsume(userId))
                .isInstanceOf(TooManyRequestsException.class)
                .hasMessageContaining("(10)");

        // Counter must remain 15, never incremented
        assertThat(redisStore.get(limitKey)).isEqualTo(15L);
    }

    @Test
    @DisplayName("Plan cache dynamic TTL: PRO subscription expiring in 5 minutes clamps TTL to 5 minutes")
    void testPlanCacheDynamicTtl_clampsToSubscriptionExpiry() {
        Long userId = 5L;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresSoon = now.plusMinutes(5);

        User user = User.builder()
                .id(userId)
                .plan(User.Plan.PRO)
                .subscriptionExpiresAt(expiresSoon)
                .build();

        when(valueOperations.get("user_plan:5")).thenReturn(null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        int limit = rateLimiter.getDailyLimit(userId);
        assertThat(limit).isEqualTo(100);

        // Verify that TTL was clamped to approximately 5 minutes (<= 5 min, > 0)
        verify(valueOperations).set(eq("user_plan:5"), eq("PRO"), argThat(duration ->
                duration.toMinutes() <= 5 && duration.toSeconds() > 0
        ));
    }
}
