package com.medev.modules.profile.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class EducationEntityTest {

    @Test
    @DisplayName("Education entity allows null degree to match DDL nullable specification")
    void testEducation_NullDegreeAllowed() {
        Profile profile = Profile.builder().id(1L).build();
        Education education = Education.builder()
                .id(10L)
                .profile(profile)
                .institution("MIT")
                .degree(null)
                .field("Computer Science")
                .startDate(LocalDate.of(2020, 9, 1))
                .endDate(LocalDate.of(2024, 6, 30))
                .isCurrent(false)
                .sortOrder(0)
                .build();

        assertThat(education.getInstitution()).isEqualTo("MIT");
        assertThat(education.getDegree()).isNull();
        assertThat(education.getField()).isEqualTo("Computer Science");
        assertThat(education.getStartDate()).isEqualTo(LocalDate.of(2020, 9, 1));
        assertThat(education.getIsCurrent()).isFalse();
    }

    @Test
    @DisplayName("Education entity sets createdAt on PrePersist")
    void testEducation_OnCreate() {
        Education education = Education.builder()
                .institution("Stanford")
                .startDate(LocalDate.of(2018, 9, 1))
                .build();

        assertThat(education.getCreatedAt()).isNull();
        education.onCreate();
        assertThat(education.getCreatedAt()).isNotNull();
        assertThat(education.getCreatedAt()).isBeforeOrEqualTo(LocalDateTime.now());
    }
}
