package com.medev.modules.profile.repository;

import com.medev.modules.profile.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByProfileIdOrderBySortOrderAsc(Long profileId);
    
    @Modifying
    @Query("UPDATE Education e SET e.sortOrder = :sortOrder WHERE e.id = :id")
    void updateSortOrder(Long id, Integer sortOrder);
}
