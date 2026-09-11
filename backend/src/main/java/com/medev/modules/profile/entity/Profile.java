package com.medev.modules.profile.entity;

import com.medev.modules.auth.entity.User;
import com.medev.shared.security.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Data
@ToString(exclude = {"user", "experiences", "educations", "skills", "languages", "projects"})
@EqualsAndHashCode(exclude = {"user", "experiences", "educations", "skills", "languages", "projects"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String fullName;
    private String headline;
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    private String avatarUrl;
    private String location;
    private String website;
    private String githubUsername;
    
    @Column(columnDefinition = "TEXT")
    @Convert(converter = EncryptedStringConverter.class)
    private String githubToken;
    
    private String telegram;
    private String linkedin;
    
    @Builder.Default
    private Boolean isPublic = true;

    @Builder.Default
    private Boolean isOnboardingCompleted = false;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private java.util.List<String> sectionOrder;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private java.util.Set<Experience> experiences = new java.util.LinkedHashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private java.util.Set<Education> educations = new java.util.LinkedHashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private java.util.Set<Skill> skills = new java.util.LinkedHashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private java.util.Set<Language> languages = new java.util.LinkedHashSet<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private java.util.Set<Project> projects = new java.util.LinkedHashSet<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
