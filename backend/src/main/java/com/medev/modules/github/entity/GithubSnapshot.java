package com.medev.modules.github.entity;

import jakarta.persistence.*;
import lombok.*;
import com.medev.modules.auth.entity.User;
import java.time.LocalDateTime;

@Entity
@Table(name = "github_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GithubSnapshot {

    @EmbeddedId
    private GithubSnapshotId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "raw_json", nullable = false, columnDefinition = "TEXT")
    private String rawJson;
}
