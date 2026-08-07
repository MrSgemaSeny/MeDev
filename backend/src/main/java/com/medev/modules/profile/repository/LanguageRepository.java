package com.medev.modules.profile.repository;

import com.medev.modules.profile.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LanguageRepository extends JpaRepository<Language, Long> {
    List<Language> findByProfileIdOrderBySortOrderAsc(Long profileId);
    
    @Modifying
    @Query("UPDATE Language l SET l.sortOrder = :sortOrder WHERE l.id = :id")
    void updateSortOrder(Long id, Integer sortOrder);
}
