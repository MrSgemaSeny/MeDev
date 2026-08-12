package com.medev.modules.tracker.repository;

import com.medev.modules.tracker.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
