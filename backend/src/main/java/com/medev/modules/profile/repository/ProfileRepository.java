package com.medev.modules.profile.repository;

import com.medev.modules.profile.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Profile p WHERE p.user.id = :userId")
    Optional<Profile> findByUserIdForUpdate(@org.springframework.data.repository.query.Param("userId") Long userId);
}
