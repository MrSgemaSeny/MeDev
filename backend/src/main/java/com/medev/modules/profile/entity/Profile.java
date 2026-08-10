package com.medev.modules.profile.entity;

import com.medev.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Data
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
    @Convert(converter = com.medev.shared.security.StringCryptoConverter.class)
    private String githubToken;
    
    private String telegram;
    private String linkedin;
    
    @Builder.Default
    private Boolean isPublic = true;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private java.util.List<String> sectionOrder;

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
