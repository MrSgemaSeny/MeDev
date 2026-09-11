package com.medev.modules.tracker.repository;

import com.medev.modules.tracker.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    // Soft limit of 200 — practical upper bound for a single user's tracked applications.
    // Full pagination is a future breaking API change; this prevents unbounded full-table loads.
    @Query("SELECT ja FROM JobApplication ja WHERE ja.user.id = :userId ORDER BY ja.updatedAt DESC LIMIT 200")
    List<JobApplication> findByUserIdOrderByUpdatedAtDesc(@Param("userId") Long userId);
}
