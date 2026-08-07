package com.medev.modules.profile.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "experience")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String position;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String techStack;

    @Column(nullable = false)
    private LocalDate startDate;
    
    private LocalDate endDate;

    @Builder.Default
    private Boolean isCurrent = false;

    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
