package com.medev.modules.profile.repository;

import com.medev.modules.profile.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByProfileIdOrderBySortOrderAsc(Long profileId);
    
    @Modifying
    @Query("UPDATE Project p SET p.sortOrder = :sortOrder WHERE p.id = :id")
    void updateSortOrder(Long id, Integer sortOrder);
}
