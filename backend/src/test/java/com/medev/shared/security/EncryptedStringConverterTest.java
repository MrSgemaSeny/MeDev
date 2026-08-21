package com.medev.shared.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EncryptedStringConverterTest {

    private EncryptedStringConverter converter;

    @BeforeEach
    void setUp() {
        EncryptionUtils.resetKeys();
        converter = new EncryptedStringConverter();
    }

    @Test
    @DisplayName("Converts non-null plaintext string to encrypted database column")
    void testConvertToDatabaseColumn() {
        String token = "gho_16C7e42F292c6912E7710c838347Ae178B4a";
        String dbColumn = converter.convertToDatabaseColumn(token);

        assertThat(dbColumn).isNotNull();
        assertThat(dbColumn).isNotEqualTo(token);

        // Convert back to verify correctness
        String entityAttribute = converter.convertToEntityAttribute(dbColumn);
        assertThat(entityAttribute).isEqualTo(token);
    }

    @Test
    @DisplayName("Converts null entity attribute to null database column")
    void testConvertToDatabaseColumnNull() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
    }

    @Test
    @DisplayName("Converts non-null encrypted database column to entity attribute")
    void testConvertToEntityAttribute() {
        String original = "my_secret_token";
        String encrypted = EncryptionUtils.encrypt(original);

        String entityAttribute = converter.convertToEntityAttribute(encrypted);
        assertThat(entityAttribute).isEqualTo(original);
    }

    @Test
    @DisplayName("Converts null database column to null entity attribute")
    void testConvertToEntityAttributeNull() {
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }
}
