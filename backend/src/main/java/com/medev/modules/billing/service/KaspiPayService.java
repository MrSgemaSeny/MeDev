package com.medev.modules.billing.service;

import com.medev.modules.audit.service.AuditService;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "kaspi.enabled", havingValue = "true", matchIfMissing = false)
public class KaspiPayService {

    private final UserRepository userRepository;
    private final org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;
    private final AuditService auditService;

    @Value("${kaspi.enabled:false}")
    private boolean kaspiEnabled;

    @Value("${kaspi.merchant-id:dummy-merchant}")
    private String merchantId;

    @Value("${kaspi.secret-key:dummy-secret-key}")
    private String secretKey;

    @Value("${kaspi.pro-price-amount:15000}")
    private Integer proPriceAmount;

    public int calculateAmount(int months) {
        if (months <= 0) {
            throw new IllegalArgumentException("Months must be positive");
        }
        if (months == 3) return 40000;
        if (months == 6) return 75000;
        if (months == 12) return 140000;
        int base = proPriceAmount != null ? proPriceAmount : 15000;
        return base * months;
    }

    /**
     * Создает сессию оплаты или генерирует ссылку на оплату в Kaspi.
     */
    public String createPaymentLink(Long userId, int months) {
        if (!kaspiEnabled) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Kaspi payments are not enabled");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getPlan() == User.Plan.PRO) {
            throw new IllegalStateException("User is already on PRO plan");
        }

        int amountToPay = calculateAmount(months);

        String mockTxnId = UUID.randomUUID().toString();
        log.info("Mock Kaspi: Generated payment link for user {} for {} months (amount: {} KZT)", userId, months, amountToPay);
        
        auditService.logAction(userId, "BILLING_KASPI_CHECKOUT_INITIATED", String.valueOf(userId), "Kaspi payment link generated for " + months + " months (amount: " + amountToPay + " KZT)", null);

        // Передаем {userId}_{months} в orderId
        return "https://pay.kaspi.kz/pay/" + merchantId + "?amount=" + amountToPay + "&orderId=" + userId + "_" + months + "&txn=" + mockTxnId;
    }

    /**
     * Обработка вебхука от Kaspi.
     * Реальное API Kaspi (Shop или Pay) присылает уведомления на зарегистрированный webhook URL.
     */
    @Transactional
    public void handleWebhook(byte[] rawPayload, String signature) {
        if (!kaspiEnabled) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Kaspi payments are not enabled");
        }

        // Шаг 1: Валидация подписи (Security!)
        if (!verifySignature(rawPayload, signature)) {
            log.error("Kaspi webhook signature verification failed!");
            throw new IllegalArgumentException("Invalid Kaspi signature");
        }

        // Шаг 2: Извлечение данных из JSON
        Map<String, Object> payload;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            payload = mapper.readValue(rawPayload, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to parse Kaspi payload", e);
            throw new IllegalArgumentException("Invalid JSON payload");
        }
        
        String status = (String) payload.getOrDefault("status", "UNKNOWN");
        String orderIdStr = (String) payload.get("orderId");
        String kaspiCustomer = (String) payload.get("kaspiCustomer");
        Object txnObj = payload.get("txnId") != null ? payload.get("txnId") : payload.get("txn");
        String txnId = txnObj != null ? String.valueOf(txnObj) : orderIdStr;

        if (orderIdStr == null || !orderIdStr.contains("_")) {
            throw new IllegalArgumentException("Invalid or missing orderId");
        }

        String[] parts = orderIdStr.split("_");
        Long userId;
        int months;
        try {
            userId = Long.parseLong(parts[0]);
            months = parts.length > 1 ? Integer.parseInt(parts[1]) : 1;
            if (months <= 0) {
                throw new IllegalArgumentException("Invalid months count in orderId");
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Malformed orderId format");
        }

        // Валидация валюты (если передана)
        String currency = (String) payload.get("currency");
        if (currency != null && !currency.equalsIgnoreCase("KZT")) {
            log.error("Kaspi webhook currency mismatch: expected KZT, got {}", currency);
            throw new IllegalArgumentException("Invalid currency");
        }

        // Валидация суммы платежа для предотвращения подмены цены
        Object amountObj = payload.get("amount");
        if (amountObj != null) {
            int paidAmount;
            try {
                paidAmount = Integer.parseInt(amountObj.toString());
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid amount format");
            }
            int expectedAmount = calculateAmount(months);
            if (paidAmount != expectedAmount) {
                log.error("Kaspi webhook amount tampering detected: expected {} KZT, got {} KZT for order {}", expectedAmount, paidAmount, orderIdStr);
                throw new IllegalArgumentException("Amount mismatch");
            }
        }

        // Idempotency check with Redis (grace period: 24h)
        String idempotencyKey = "kaspi:webhook:" + (txnId != null ? txnId : orderIdStr);
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(idempotencyKey, "PROCESSED", Duration.ofHours(24));
        if (Boolean.FALSE.equals(isNew)) {
            log.info("Kaspi webhook event {} already processed, skipping", idempotencyKey);
            return;
        }

        try {
            if ("COMPLETED".equalsIgnoreCase(status)) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new NotFoundException("User not found from Kaspi payload: " + userId));

                user.setPlan(User.Plan.PRO);
                if (kaspiCustomer != null) {
                    user.setKaspiCustomerId(kaspiCustomer);
                }
                
                LocalDateTime now = LocalDateTime.now();
                if (user.getSubscriptionExpiresAt() != null && user.getSubscriptionExpiresAt().isAfter(now)) {
                    user.setSubscriptionExpiresAt(user.getSubscriptionExpiresAt().plusMonths(months));
                } else {
                    user.setSubscriptionExpiresAt(now.plusMonths(months));
                }
                
                userRepository.save(user);
                log.info("Successfully upgraded user {} to PRO for {} months via Kaspi Pay", userId, months);
                auditService.logAction(userId, "BILLING_KASPI_PAYMENT_SUCCESS", orderIdStr, "Upgraded to PRO for " + months + " months via Kaspi Pay", null);
            } else if ("FAILED".equalsIgnoreCase(status) || "REFUNDED".equalsIgnoreCase(status)) {
                if (kaspiCustomer != null) {
                    downgradeUser(kaspiCustomer);
                }
            }
        } catch (Exception e) {
            redisTemplate.delete(idempotencyKey);
            log.error("Error processing Kaspi webhook event {}, cleared idempotency lock", idempotencyKey, e);
            throw e;
        }
    }

    private boolean verifySignature(byte[] rawPayload, String signature) {
        if (signature == null || signature.isBlank()) {
            return false;
        }
        if (secretKey == null || secretKey.isBlank()) {
            log.error("Kaspi secret key is not configured!");
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            
            byte[] hashBytes = mac.doFinal(rawPayload);
            
            StringBuilder hexString = new StringBuilder(2 * hashBytes.length);
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            String expected = hexString.toString();
            
            return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.toLowerCase().getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Kaspi signature verification error", e);
            return false;
        }
    }

    private void downgradeUser(String kaspiCustomer) {
        userRepository.findByKaspiCustomerId(kaspiCustomer).ifPresent(user -> {
            user.setPlan(User.Plan.FREE);
            userRepository.save(user);
            log.info("Downgraded user {} to FREE plan via Kaspi Pay refund", user.getId());
            auditService.logAction(user.getId(), "BILLING_KASPI_PAYMENT_REFUNDED", kaspiCustomer, "Downgraded to FREE plan via Kaspi refund", null);
        });
    }
}
