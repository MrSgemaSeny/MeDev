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
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiRateLimiterTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AiRateLimiter rateLimiter;

    private User freeUser;
    private User proUser;

    @BeforeEach
    void setUp() {
        lenient().when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);

        freeUser = User.builder()
                .id(1L)
                .email("free@medev.com")
                .plan(User.Plan.FREE)
                .build();

        proUser = User.builder()
                .id(2L)
                .email("pro@medev.com")
                .plan(User.Plan.PRO)
                .subscriptionExpiresAt(LocalDateTime.now().plusDays(10))
                .build();
    }

    @Test
    @DisplayName("checkAndConsume succeeds when within limit")
    void checkAndConsume_withinLimit_succeeds() {
        when(valueOperations.get("user_plan:1")).thenReturn("FREE");
        when(stringRedisTemplate.execute(
                any(RedisScript.class),
                anyList(),
                eq("10"),
                anyString()
        )).thenReturn(1L);

        rateLimiter.checkAndConsume(1L);

        verify(stringRedisTemplate).execute(
                any(RedisScript.class),
                eq(Collections.singletonList("ai_limit:1:" + java.time.LocalDate.now())),
                eq("10"),
                anyString()
        );
    }

    @Test
    @DisplayName("checkAndConsume throws TooManyRequestsException when limit exceeded")
    void checkAndConsume_limitExceeded_throwsException() {
        when(valueOperations.get("user_plan:1")).thenReturn("FREE");
        when(stringRedisTemplate.execute(
                any(RedisScript.class),
                anyList(),
                eq("10"),
                anyString()
        )).thenReturn(-1L);

        assertThatThrownBy(() -> rateLimiter.checkAndConsume(1L))
                .isInstanceOf(TooManyRequestsException.class)
                .hasMessageContaining("Вы достигли дневного лимита AI-запросов (10)");
    }

    @Test
    @DisplayName("User with active PRO plan gets PRO limit (100)")
    void getDailyLimit_proUser_returnsProLimit() {
        when(valueOperations.get("user_plan:2")).thenReturn(null);
        when(userRepository.findById(2L)).thenReturn(Optional.of(proUser));

        int limit = rateLimiter.getDailyLimit(2L);

        assertThat(limit).isEqualTo(100);
        verify(valueOperations).set(eq("user_plan:2"), eq("PRO"), any(Duration.class));
    }

    @Test
    @DisplayName("User with expired PRO plan falls back to FREE limit (10)")
    void getDailyLimit_expiredProUser_returnsFreeLimit() {
        User expiredUser = User.builder()
                .id(3L)
                .email("expired@medev.com")
                .plan(User.Plan.PRO)
                .subscriptionExpiresAt(LocalDateTime.now().minusHours(1))
                .build();

        when(valueOperations.get("user_plan:3")).thenReturn(null);
        when(userRepository.findById(3L)).thenReturn(Optional.of(expiredUser));

        int limit = rateLimiter.getDailyLimit(3L);

        assertThat(limit).isEqualTo(10);
        verify(valueOperations).set(eq("user_plan:3"), eq("FREE"), eq(Duration.ofMinutes(15)));
    }

    @Test
    @DisplayName("evictUserPlan deletes Redis key user_plan:<userId>")
    void evictUserPlan_deletesKey() {
        rateLimiter.evictUserPlan(5L);

        verify(stringRedisTemplate).delete("user_plan:5");
    }

    @Test
    @DisplayName("getRemainingRequests calculates difference between limit and consumed tokens")
    void getRemainingRequests_calculatesRemaining() {
        when(valueOperations.get("user_plan:1")).thenReturn("FREE");
        when(valueOperations.get("ai_limit:1:" + java.time.LocalDate.now())).thenReturn("4");

        long remaining = rateLimiter.getRemainingRequests(1L);

        assertThat(remaining).isEqualTo(6L);
    }

    @Test
    @DisplayName("Concurrent requests with atomic Lua script reject over-limit executions")
    void concurrentRequests_atomicitySimulation() throws InterruptedException {
        int threads = 10;
        int limit = 5;
        AtomicInteger consumed = new AtomicInteger(0);
        AtomicInteger rejected = new AtomicInteger(0);

        when(valueOperations.get("user_plan:1")).thenReturn("FREE");
        // Simulate Lua script execution where first 5 succeed, subsequent return -1
        AtomicInteger counter = new AtomicInteger(0);
        when(stringRedisTemplate.execute(any(RedisScript.class), anyList(), anyString(), anyString()))
                .thenAnswer(inv -> {
                    int c = counter.incrementAndGet();
                    return c <= limit ? (long) c : -1L;
                });

        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(threads);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    rateLimiter.checkAndConsume(1L);
                    consumed.incrementAndGet();
                } catch (TooManyRequestsException e) {
                    rejected.incrementAndGet();
                } catch (Exception ignored) {
                } finally {
                    endLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        endLatch.await();
        executor.shutdown();

        assertThat(consumed.get()).isEqualTo(5);
        assertThat(rejected.get()).isEqualTo(5);
    }
}
