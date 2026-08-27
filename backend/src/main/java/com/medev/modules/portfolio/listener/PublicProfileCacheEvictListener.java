package com.medev.modules.portfolio.listener;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.modules.profile.event.ProfileUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Слушает ProfileUpdatedEvent и инвалидирует запись в кэше public-profiles.
 *
 * Почему не @CacheEvict в ProfileService:
 *   ProfileService не знает username — он работает только с userId.
 *   Этот listener резолвит username и эвиктит нужный ключ.
 *   Async чтобы не блокировать транзакцию мутации.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PublicProfileCacheEvictListener {

    private final CacheManager cacheManager;
    private final UserRepository userRepository;

    @Async
    @EventListener
    public void onProfileUpdated(ProfileUpdatedEvent event) {
        userRepository.findById(event.getUserId()).ifPresent(user -> {
            String username = user.getUsername();
            if (username == null) return;

            var cache = cacheManager.getCache("public-profiles");
            if (cache != null) {
                cache.evict(username.toLowerCase());
                log.debug("Cache 'public-profiles' evicted for key='{}'", username.toLowerCase());
            }
        });
    }
}
