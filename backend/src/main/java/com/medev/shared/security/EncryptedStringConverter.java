package com.medev.shared.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isBlank()) {
            return attribute;
        }
        try {
            return EncryptionUtils.encrypt(attribute);
        } catch (Exception e) {
            log.warn("[EncryptedStringConverter] Failed to encrypt attribute, saving as-is: {}", e.getMessage());
            return attribute;
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return dbData;
        }
        try {
            return EncryptionUtils.decrypt(dbData);
        } catch (Exception e) {
            log.warn("[EncryptedStringConverter] Failed to decrypt token (unencrypted or legacy key), falling back to raw value: {}", e.getMessage());
            return dbData;
        }
    }
}
