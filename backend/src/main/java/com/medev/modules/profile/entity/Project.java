package com.medev.modules.profile.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "tech_stack")
    private String techStack;
    
    @Column(name = "github_url")
    private String githubUrl;
    
    @Column(name = "live_url")
    private String liveUrl;
    
    @Builder.Default
    private Integer stars = 0;
    
    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;
    
    @Column(name = "is_visible")
    @Builder.Default
    private Boolean isVisible = true;

    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
