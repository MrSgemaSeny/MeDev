package com.medev.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * L1 Caffeine cache manager.
     *
     * Регионы:
     *  - profiles        : приватный профиль пользователя (дашборд). TTL 5 мин, max 500.
     *  - public-profiles : публичное портфолио (/:username). TTL 10 мин, max 1000.
     *                      Этот регион — основная защита от HikariCP exhaustion под нагрузкой.
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();

        manager.registerCustomCache("profiles",
                Caffeine.newBuilder()
                        .maximumSize(500)
                        .expireAfterWrite(5, TimeUnit.MINUTES)
                        .build());

        manager.registerCustomCache("public-profiles",
                Caffeine.newBuilder()
                        .maximumSize(1000)
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .build());

        return manager;
    }
}
