package com.medev.modules.ai.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class PiiMaskerTest {

    private PiiMasker piiMasker;

    @BeforeEach
    void setUp() {
        piiMasker = new PiiMasker();
    }

    @Test
    void mask_nullOrEmpty_returnsNullOrEmpty() {
        assertThat(piiMasker.mask(null)).isNull();
        assertThat(piiMasker.mask("")).isEqualTo("");
    }

    @Test
    void mask_preservesTechnicalTermsAndCapitalizedWords() {
        String input = "Software Engineer with 5 years of experience in Spring Boot, React, and PostgreSQL. " +
                "Graduated with Bachelor of Science in Computer Science from Stanford University in Almaty Kazakhstan.";
        
        String result = piiMasker.mask(input);

        // Technical terms, degrees, and institutions must NOT be replaced with [NAME]
        assertThat(result).contains("Software Engineer");
        assertThat(result).contains("Spring Boot");
        assertThat(result).contains("React");
        assertThat(result).contains("PostgreSQL");
        assertThat(result).contains("Bachelor of Science");
        assertThat(result).contains("Computer Science");
        assertThat(result).contains("Stanford University");
        assertThat(result).contains("Almaty Kazakhstan");
        assertThat(result).doesNotContain("[NAME]");
    }

    @Test
    void mask_masksEmailAddresses() {
        String input = "Contact me at john.doe@company.org or dev_test123+tag@gmail.com for job inquiries.";
        String result = piiMasker.mask(input);

        assertThat(result).isEqualTo("Contact me at [EMAIL] or [EMAIL] for job inquiries.");
    }

    @Test
    void mask_masksIdAndSsnNumbers() {
        String input = "US SSN: 123-45-6789, Kazakh IIN: 980123350123, BIN: 123456789012.";
        String result = piiMasker.mask(input);

        assertThat(result).isEqualTo("US SSN: [ID_NUMBER], Kazakh IIN: [ID_NUMBER], BIN: [ID_NUMBER].");
    }

    @Test
    void mask_masksPhoneNumbers() {
        String input = "Call +7 (777) 123-45-67, +1-555-123-4567, or 87011234567.";
        String result = piiMasker.mask(input);

        assertThat(result).contains("[PHONE]");
        assertThat(result).doesNotContain("123-45-67");
    }

    @Test
    void mask_preservesDateRanges() {
        String input = "Experience: 2022-09-01 - 2026-06-01 at TechCorp.";
        String result = piiMasker.mask(input);

        assertThat(result).contains("2022-09-01 - 2026-06-01");
    }
}
