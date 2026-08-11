package com.medev.modules.ai.repository;

import com.medev.modules.ai.entity.AiEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiEvaluationRepository extends JpaRepository<AiEvaluation, Long> {
}
