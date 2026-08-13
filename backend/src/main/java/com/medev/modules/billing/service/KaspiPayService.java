package com.medev.modules.billing.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KaspiPayService {

    private final UserRepository userRepository;

    @Value("${kaspi.merchant-id}")
    private String merchantId;

    @Value("${kaspi.secret-key}")
    private String secretKey;

    @Value("${kaspi.pro-price-amount}")
    private Integer proPriceAmount;

    /**
     * Создает сессию оплаты или генерирует ссылку на оплату в Kaspi.
     */
    public String createPaymentLink(Long userId, int months) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getPlan() == User.Plan.PRO) {
            throw new IllegalStateException("User is already on PRO plan");
        }

        // В реальном приложении здесь делается HTTP-вызов к Kaspi API:
        // HttpHeaders headers = new HttpHeaders();
        // headers.set("Authorization", "Bearer " + secretKey);
        // ... (сборка payload)
        // String response = restTemplate.postForObject("https://api.kaspi.kz/v1/payments", payload, String.class);

        int amountToPay = proPriceAmount * months;
        if (months == 3) amountToPay = 40000;
        if (months == 6) amountToPay = 75000;

        // Имитируем получение ссылки на оплату
        String mockTxnId = UUID.randomUUID().toString();
        log.info("Mock Kaspi: Generated payment link for user {} for {} months", userId, months);
        
        // Передаем {userId}_{months} в orderId
        return "https://pay.kaspi.kz/pay/" + merchantId + "?amount=" + amountToPay + "&orderId=" + userId + "_" + months + "&txn=" + mockTxnId;
    }

    /**
     * Обработка вебхука от Kaspi.
     * Реальное API Kaspi (Shop или Pay) присылает уведомления на зарегистрированный webhook URL.
     */
    @Transactional
    public void handleWebhook(Map<String, Object> payload, String signature) {
        // Шаг 1: Валидация подписи (Security!)
        if (!verifySignature(payload, signature)) {
            log.error("Kaspi webhook signature verification failed!");
            throw new IllegalArgumentException("Invalid Kaspi signature");
        }

        // Шаг 2: Извлечение данных из JSON
        // Формат зависит от конкретного Kaspi API, например:
        // { "orderId": "1", "status": "COMPLETED", "kaspiCustomer": "K-123456" }
        
        String status = (String) payload.getOrDefault("status", "UNKNOWN");
        String orderIdStr = (String) payload.get("orderId");
        String kaspiCustomer = (String) payload.get("kaspiCustomer");

        if ("COMPLETED".equalsIgnoreCase(status) && orderIdStr != null) {
            String[] parts = orderIdStr.split("_");
            Long userId = Long.parseLong(parts[0]);
            int months = parts.length > 1 ? Integer.parseInt(parts[1]) : 1;

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User not found from Kaspi payload: " + userId));

            user.setPlan(User.Plan.PRO);
            if (kaspiCustomer != null) {
                user.setKaspiCustomerId(kaspiCustomer);
            }
            
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            if (user.getSubscriptionExpiresAt() != null && user.getSubscriptionExpiresAt().isAfter(now)) {
                user.setSubscriptionExpiresAt(user.getSubscriptionExpiresAt().plusMonths(months));
            } else {
                user.setSubscriptionExpiresAt(now.plusMonths(months));
            }
            
            userRepository.save(user);
            log.info("Successfully upgraded user {} to PRO for {} months via Kaspi Pay", userId, months);
        } else if ("FAILED".equalsIgnoreCase(status) || "REFUNDED".equalsIgnoreCase(status)) {
            // Если оплата отменена или возврат
            if (kaspiCustomer != null) {
                downgradeUser(kaspiCustomer);
            }
        }
    }

    /**
     * Защита вебхука: имитация проверки HMAC-SHA256 подписи.
     */
    private boolean verifySignature(Map<String, Object> payload, String signature) {
        if (signature == null || signature.isBlank()) {
            return false;
        }
        // В реальном мире:
        // String payloadStr = mapper.writeValueAsString(payload);
        // String expectedHash = HmacUtils.hmacSha256Hex(secretKey, payloadStr);
        // return expectedHash.equals(signature);
        
        // Для шаблона мы принимаем любую подпись, если она не пустая.
        return true;
    }

    private void downgradeUser(String kaspiCustomer) {
        userRepository.findByKaspiCustomerId(kaspiCustomer).ifPresent(user -> {
            user.setPlan(User.Plan.FREE);
            userRepository.save(user);
            log.info("Downgraded user {} to FREE plan via Kaspi Pay refund", user.getId());
        });
    }
}
