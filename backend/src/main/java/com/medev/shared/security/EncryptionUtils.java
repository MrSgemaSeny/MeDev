package com.medev.shared.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class EncryptionUtils {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static byte[] key;

    @Value("${encryption.secret}")
    public void setKey(String secret) {
        byte[] keyBytes = new byte[32];
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        System.arraycopy(secretBytes, 0, keyBytes, 0, Math.min(secretBytes.length, keyBytes.length));
        EncryptionUtils.key = keyBytes;
    }

    public static String encrypt(String value) {
        if (value == null) return null;
        if (key == null) throw new IllegalStateException("Encryption key not initialized");
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new java.security.SecureRandom().nextBytes(iv);
            
            javax.crypto.spec.GCMParameterSpec paramSpec = new javax.crypto.spec.GCMParameterSpec(GCM_TAG_LENGTH, iv);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), paramSpec);
            byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Error while encrypting data", e);
        }
    }

    public static String decrypt(String value) {
        if (value == null) return null;
        if (key == null) throw new IllegalStateException("Encryption key not initialized");
        try {
            byte[] combined = Base64.getDecoder().decode(value);
            if (combined.length <= GCM_IV_LENGTH) {
                throw new RuntimeException("Encrypted data is too short");
            }
            byte[] iv = java.util.Arrays.copyOfRange(combined, 0, GCM_IV_LENGTH);
            byte[] ciphertext = java.util.Arrays.copyOfRange(combined, GCM_IV_LENGTH, combined.length);
            
            javax.crypto.spec.GCMParameterSpec paramSpec = new javax.crypto.spec.GCMParameterSpec(GCM_TAG_LENGTH, iv);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), paramSpec);
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error while decrypting data", e);
        }
    }
}
