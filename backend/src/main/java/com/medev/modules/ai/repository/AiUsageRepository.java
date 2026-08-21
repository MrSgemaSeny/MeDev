package com.medev.modules.ai.repository;

import com.medev.modules.ai.entity.AiUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface AiUsageRepository extends JpaRepository<AiUsage, Long> {

    @Query("SELECT COALESCE(SUM(u.totalTokens), 0) FROM AiUsage u WHERE u.createdAt >= :since")
    long sumTotalTokensSince(@Param("since") Instant since);

    @Query("SELECT COALESCE(SUM(u.totalTokens), 0) FROM AiUsage u")
    long sumTotalTokens();

    @Query("SELECT COALESCE(SUM(u.promptTokens), 0) FROM AiUsage u WHERE u.createdAt >= :since")
    long sumPromptTokensSince(@Param("since") Instant since);

    @Query("SELECT COALESCE(SUM(u.completionTokens), 0) FROM AiUsage u WHERE u.createdAt >= :since")
    long sumCompletionTokensSince(@Param("since") Instant since);
}
