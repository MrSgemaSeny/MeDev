package com.medev.modules.profile.repository;

import com.medev.modules.profile.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    
    @Modifying
    @Query("UPDATE Experience e SET e.sortOrder = :sortOrder WHERE e.id = :id")
    void updateSortOrder(@Param("id") Long id, @Param("sortOrder") int sortOrder);
}
