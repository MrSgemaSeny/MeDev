package com.medev.modules.github.repository;

import com.medev.modules.github.entity.GithubSnapshot;
import com.medev.modules.github.entity.GithubSnapshotId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GithubSnapshotRepository extends JpaRepository<GithubSnapshot, GithubSnapshotId> {
    Optional<GithubSnapshot> findFirstByIdUserIdOrderByIdFetchedAtDesc(Long userId);
}
