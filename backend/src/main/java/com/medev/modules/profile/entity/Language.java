package com.medev.modules.profile.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "languages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Language {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(nullable = false)
    private String name;
    
    private String level;

    @Builder.Default
    private Integer sortOrder = 0;
}
