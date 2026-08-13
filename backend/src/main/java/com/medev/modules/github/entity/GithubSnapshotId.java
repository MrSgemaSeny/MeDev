package com.medev.modules.github.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GithubSnapshotId implements Serializable {
    private Long userId;
    private LocalDateTime fetchedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GithubSnapshotId that = (GithubSnapshotId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(fetchedAt, that.fetchedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, fetchedAt);
    }
}
