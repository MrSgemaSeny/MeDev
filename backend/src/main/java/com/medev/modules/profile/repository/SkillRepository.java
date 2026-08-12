package com.medev.modules.profile.repository;

import com.medev.modules.profile.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByProfileIdOrderBySortOrderAsc(Long profileId);
    void deleteByProfileId(Long profileId);
    
    @Modifying
    @Query("UPDATE Skill s SET s.sortOrder = :sortOrder WHERE s.id = :id")
    void updateSortOrder(Long id, Integer sortOrder);
}
