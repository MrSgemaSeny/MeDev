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

    @Test
    @DisplayName("Converts blank database column to blank entity attribute without error")
    void testConvertToEntityAttributeBlank() {
        assertThat(converter.convertToEntityAttribute("")).isEqualTo("");
        assertThat(converter.convertToEntityAttribute("   ")).isEqualTo("   ");
    }

    @Test
    @DisplayName("Converts blank entity attribute to blank database column without error")
    void testConvertToDatabaseColumnBlank() {
        assertThat(converter.convertToDatabaseColumn("")).isEqualTo("");
        assertThat(converter.convertToDatabaseColumn("   ")).isEqualTo("   ");
    }

    @Test
    @DisplayName("Gracefully falls back to raw string when database column contains unencrypted legacy token")
    void testLegacyPlaintextFallback() {
        String legacyToken = "gho_16C7e42F292c6912E7710c838347Ae178B4a";
        String entityAttribute = converter.convertToEntityAttribute(legacyToken);
        assertThat(entityAttribute).isEqualTo(legacyToken);
    }

    @Test
    @DisplayName("Gracefully falls back to raw string when decryption fails due to corrupted ciphertext")
    void testCorruptedDataFallback() {
        String corruptedCiphertext = "not_valid_base64_or_bad_tag_data";
        String entityAttribute = converter.convertToEntityAttribute(corruptedCiphertext);
        assertThat(entityAttribute).isEqualTo(corruptedCiphertext);
    }

    @Test
    @DisplayName("Gracefully falls back to raw string when ciphertext was encrypted with unknown key")
    void testUnknownKeyFallback() {
        EncryptionUtils.setKeysForTesting("original_key_32_bytes_long_12345", null);
        String encrypted = converter.convertToDatabaseColumn("my_token");

        // Switch to totally different key
        EncryptionUtils.setKeysForTesting("different_key_32_bytes_long_6789", null);
        String decrypted = converter.convertToEntityAttribute(encrypted);
        // Does not throw 500 runtime exception, returns raw ciphertext fallback
        assertThat(decrypted).isEqualTo(encrypted);
    }
}
