package com.medev.shared.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class EncryptionUtilsTest {

    @BeforeEach
    void setUp() {
        EncryptionUtils.resetKeys();
    }

    @AfterEach
    void tearDown() {
        EncryptionUtils.resetKeys();
    }

    @Test
    @DisplayName("Encrypt and decrypt roundtrip preserves original plaintext")
    void testEncryptDecryptRoundtrip() {
        String original = "ghp_secure_oauth_token_1234567890abcdef";
        String encrypted = EncryptionUtils.encrypt(original);

        assertThat(encrypted).isNotNull();
        assertThat(encrypted).isNotEqualTo(original);

        String decrypted = EncryptionUtils.decrypt(encrypted);
        assertThat(decrypted).isEqualTo(original);
    }

    @Test
    @DisplayName("Encrypting identical plaintext produces different ciphertexts due to random IVs")
    void testRandomIvProducesDifferentCiphertexts() {
        String secretData = "same_secret_string";
        String encrypted1 = EncryptionUtils.encrypt(secretData);
        String encrypted2 = EncryptionUtils.encrypt(secretData);

        assertThat(encrypted1).isNotEqualTo(encrypted2);

        // Both must decrypt back to original plaintext
        assertThat(EncryptionUtils.decrypt(encrypted1)).isEqualTo(secretData);
        assertThat(EncryptionUtils.decrypt(encrypted2)).isEqualTo(secretData);
    }

    @Test
    @DisplayName("Null safety for encrypt and decrypt operations")
    void testNullSafety() {
        assertThat(EncryptionUtils.encrypt(null)).isNull();
        assertThat(EncryptionUtils.decrypt(null)).isNull();
    }

    @Test
    @DisplayName("Empty string encryption and decryption works correctly")
    void testEmptyStringEncryption() {
        String encrypted = EncryptionUtils.encrypt("");
        assertThat(encrypted).isNotNull();
        assertThat(EncryptionUtils.decrypt(encrypted)).isEqualTo("");
    }

    @Test
    @DisplayName("Tampered ciphertext fails authentication check in AES-GCM")
    void testTamperedCiphertextThrowsException() {
        String original = "sensitive_api_secret_key";
        String encrypted = EncryptionUtils.encrypt(original);

        byte[] raw = Base64.getDecoder().decode(encrypted);
        // Flip the last byte of ciphertext/tag
        raw[raw.length - 1] = (byte) (raw[raw.length - 1] ^ 0xFF);
        String tampered = Base64.getEncoder().encodeToString(raw);

        assertThatThrownBy(() -> EncryptionUtils.decrypt(tampered))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error while decrypting data");
    }

    @Test
    @DisplayName("Tampered IV fails decryption in AES-GCM")
    void testTamperedIvThrowsException() {
        String original = "sensitive_api_secret_key";
        String encrypted = EncryptionUtils.encrypt(original);

        byte[] raw = Base64.getDecoder().decode(encrypted);
        // Flip the first byte of IV
        raw[0] = (byte) (raw[0] ^ 0xFF);
        String tampered = Base64.getEncoder().encodeToString(raw);

        assertThatThrownBy(() -> EncryptionUtils.decrypt(tampered))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error while decrypting data");
    }

    @Test
    @DisplayName("Short corrupted ciphertext throws exception")
    void testShortCiphertextThrowsException() {
        String shortCiphertext = Base64.getEncoder().encodeToString(new byte[]{1, 2, 3});

        assertThatThrownBy(() -> EncryptionUtils.decrypt(shortCiphertext))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("Invalid Base64 string throws exception during decryption")
    void testInvalidBase64ThrowsException() {
        assertThatThrownBy(() -> EncryptionUtils.decrypt("!!!not_base64!!!"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("Secondary key fallback enables zero-downtime key rotation")
    void testSecondaryKeyFallbackRotation() {
        String oldKey = "old_encryption_key_32_bytes_long_12345";
        String newKey = "new_encryption_key_32_bytes_long_67890";

        // 1. Encrypt with old key as primary
        EncryptionUtils.setKeysForTesting(oldKey, null);
        String encryptedWithOldKey = EncryptionUtils.encrypt("data_encrypted_under_old_key");

        // 2. Rotate keys: newKey is primary, oldKey is secondary
        EncryptionUtils.setKeysForTesting(newKey, oldKey);

        // 3. New encryption uses new key
        String encryptedWithNewKey = EncryptionUtils.encrypt("data_encrypted_under_new_key");
        assertThat(EncryptionUtils.decrypt(encryptedWithNewKey)).isEqualTo("data_encrypted_under_new_key");

        // 4. Old data decrypts successfully via secondary fallback
        assertThat(EncryptionUtils.decrypt(encryptedWithOldKey)).isEqualTo("data_encrypted_under_old_key");
    }

    @Test
    @DisplayName("Fails if both primary and secondary keys are unable to decrypt data")
    void testBothKeysFailThrowsException() {
        String keyA = "key_a_32_bytes_long_00000000000000";
        String keyB = "key_b_32_bytes_long_00000000000000";
        String keyC = "key_c_32_bytes_long_00000000000000";

        EncryptionUtils.setKeysForTesting(keyA, null);
        String encryptedWithKeyA = EncryptionUtils.encrypt("secret_payload");

        // Set keyB and keyC (neither matches keyA)
        EncryptionUtils.setKeysForTesting(keyB, keyC);

        assertThatThrownBy(() -> EncryptionUtils.decrypt(encryptedWithKeyA))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error while decrypting data with both primary and secondary keys");
    }

    @Test
    @DisplayName("Production profile with default secret key throws IllegalStateException")
    void testProdProfileWithDefaultSecretThrowsException() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});

        EncryptionUtils utils = new EncryptionUtils(env, EncryptionUtils.DEFAULT_SECRET, null);

        assertThatThrownBy(utils::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("FATAL: Default encryption key used in production!");
    }

    @Test
    @DisplayName("Production profile with custom secret key initializes successfully")
    void testProdProfileWithCustomSecretSucceeds() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});

        EncryptionUtils utils = new EncryptionUtils(env, "custom_prod_secret_key_32_bytes_length_123", null);
        utils.init();

        String encrypted = EncryptionUtils.encrypt("prod_token");
        assertThat(EncryptionUtils.decrypt(encrypted)).isEqualTo("prod_token");
    }

    @Test
    @DisplayName("Development profile with default secret initializes successfully")
    void testDevProfileWithDefaultSecretSucceeds() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"dev"});

        EncryptionUtils utils = new EncryptionUtils(env, EncryptionUtils.DEFAULT_SECRET, null);
        utils.init();

        String encrypted = EncryptionUtils.encrypt("dev_token");
        assertThat(EncryptionUtils.decrypt(encrypted)).isEqualTo("dev_token");
    }
}
