package com.medev.shared.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CryptoUtilsTest {

    @Test
    void sha256Hex_nullInput_returnsNull() {
        assertThat(CryptoUtils.sha256Hex(null)).isNull();
    }

    @Test
    void sha256Hex_emptyString_returnsExpectedDigest() {
        // SHA-256 of empty string is e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
        assertThat(CryptoUtils.sha256Hex(""))
                .isEqualTo("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    }

    @Test
    void sha256Hex_deterministic() {
        String input = "test-token-12345";
        String hash1 = CryptoUtils.sha256Hex(input);
        String hash2 = CryptoUtils.sha256Hex(input);

        assertThat(hash1).isNotNull().hasSize(64);
        assertThat(hash1).isEqualTo(hash2);
    }
}
