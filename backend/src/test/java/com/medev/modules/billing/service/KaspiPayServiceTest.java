package com.medev.modules.billing.service;

import com.medev.modules.audit.service.AuditService;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KaspiPayServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private KaspiPayService kaspiPayService;

    private final String secretKey = "test-secret-key-12345678901234567890";

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(true);

        ReflectionTestUtils.setField(kaspiPayService, "kaspiEnabled", true);
        ReflectionTestUtils.setField(kaspiPayService, "merchantId", "merchant123");
        ReflectionTestUtils.setField(kaspiPayService, "secretKey", secretKey);
        ReflectionTestUtils.setField(kaspiPayService, "proPriceAmount", 15000);
    }

    private String calculateSignature(byte[] payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(payload);
        StringBuilder sb = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) sb.append('0');
            sb.append(hex);
        }
        return sb.toString();
    }

    @Test
    @DisplayName("calculateAmount returns tiered pricing correctly")
    void testCalculateAmount() {
        assertThat(kaspiPayService.calculateAmount(1)).isEqualTo(15000);
        assertThat(kaspiPayService.calculateAmount(2)).isEqualTo(30000);
        assertThat(kaspiPayService.calculateAmount(3)).isEqualTo(40000);
        assertThat(kaspiPayService.calculateAmount(6)).isEqualTo(75000);
        assertThat(kaspiPayService.calculateAmount(12)).isEqualTo(140000);

        assertThatThrownBy(() -> kaspiPayService.calculateAmount(0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("createPaymentLink generates signed URL with correct tier amount and orderId")
    void testCreatePaymentLink_Success() {
        User user = User.builder().id(5L).email("user@test.com").plan(User.Plan.FREE).build();
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        String url = kaspiPayService.createPaymentLink(5L, 3);

        assertThat(url).contains("https://pay.kaspi.kz/pay/merchant123");
        assertThat(url).contains("amount=40000");
        assertThat(url).contains("orderId=5_3");
        verify(auditService).logAction(eq(5L), eq("BILLING_KASPI_CHECKOUT_INITIATED"), eq("5"), anyString(), isNull());
    }

    @Test
    @DisplayName("createPaymentLink throws when user is already on PRO plan")
    void testCreatePaymentLink_AlreadyPro() {
        User user = User.builder().id(5L).email("pro@test.com").plan(User.Plan.PRO).build();
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> kaspiPayService.createPaymentLink(5L, 1))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already on PRO plan");
    }

    @Test
    @DisplayName("createPaymentLink throws when Kaspi is disabled")
    void testCreatePaymentLink_Disabled() {
        ReflectionTestUtils.setField(kaspiPayService, "kaspiEnabled", false);

        assertThatThrownBy(() -> kaspiPayService.createPaymentLink(5L, 1))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    @DisplayName("handleWebhook verifies HMAC signature and rejects invalid signature")
    void testHandleWebhook_InvalidSignature() {
        byte[] payload = "{\"status\":\"COMPLETED\",\"orderId\":\"5_1\"}".getBytes(StandardCharsets.UTF_8);

        assertThatThrownBy(() -> kaspiPayService.handleWebhook(payload, "invalid-sig"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid Kaspi signature");
    }

    @Test
    @DisplayName("handleWebhook detects amount tampering and throws exception")
    void testHandleWebhook_AmountTampering() throws Exception {
        // User paid 1000 KZT instead of 15000 KZT for 1 month
        String json = "{\"status\":\"COMPLETED\",\"orderId\":\"5_1\",\"amount\":1000,\"currency\":\"KZT\"}";
        byte[] payload = json.getBytes(StandardCharsets.UTF_8);
        String sig = calculateSignature(payload);

        assertThatThrownBy(() -> kaspiPayService.handleWebhook(payload, sig))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount mismatch");
    }

    @Test
    @DisplayName("handleWebhook detects invalid currency and throws exception")
    void testHandleWebhook_InvalidCurrency() throws Exception {
        String json = "{\"status\":\"COMPLETED\",\"orderId\":\"5_1\",\"amount\":15000,\"currency\":\"USD\"}";
        byte[] payload = json.getBytes(StandardCharsets.UTF_8);
        String sig = calculateSignature(payload);

        assertThatThrownBy(() -> kaspiPayService.handleWebhook(payload, sig))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid currency");
    }

    @Test
    @DisplayName("handleWebhook enforces Redis idempotency and skips duplicate events")
    void testHandleWebhook_IdempotencyDuplicate() throws Exception {
        String json = "{\"status\":\"COMPLETED\",\"orderId\":\"5_1\",\"amount\":15000,\"currency\":\"KZT\",\"txnId\":\"txn_999\"}";
        byte[] payload = json.getBytes(StandardCharsets.UTF_8);
        String sig = calculateSignature(payload);

        when(valueOperations.setIfAbsent(eq("kaspi:webhook:txn_999"), eq("PROCESSED"), any(Duration.class))).thenReturn(false);

        kaspiPayService.handleWebhook(payload, sig);

        verify(userRepository, never()).save(any());
        verify(auditService, never()).logAction(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("handleWebhook successfully upgrades user to PRO with proper expiry")
    void testHandleWebhook_CompletedSuccess() throws Exception {
        String json = "{\"status\":\"COMPLETED\",\"orderId\":\"5_3\",\"amount\":40000,\"currency\":\"KZT\",\"kaspiCustomer\":\"kaspi_cus_123\",\"txnId\":\"txn_100\"}";
        byte[] payload = json.getBytes(StandardCharsets.UTF_8);
        String sig = calculateSignature(payload);

        User user = User.builder().id(5L).plan(User.Plan.FREE).build();
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        kaspiPayService.handleWebhook(payload, sig);

        assertThat(user.getPlan()).isEqualTo(User.Plan.PRO);
        assertThat(user.getKaspiCustomerId()).isEqualTo("kaspi_cus_123");
        assertThat(user.getSubscriptionExpiresAt()).isNotNull();
        assertThat(user.getSubscriptionExpiresAt()).isAfter(LocalDateTime.now().plusMonths(2));
        verify(userRepository).save(user);
        verify(auditService).logAction(eq(5L), eq("BILLING_KASPI_PAYMENT_SUCCESS"), eq("5_3"), anyString(), isNull());
    }

    @Test
    @DisplayName("handleWebhook downgrades user on REFUNDED status")
    void testHandleWebhook_Refunded() throws Exception {
        String json = "{\"status\":\"REFUNDED\",\"orderId\":\"5_1\",\"amount\":15000,\"kaspiCustomer\":\"kaspi_cus_123\",\"txnId\":\"txn_refund_1\"}";
        byte[] payload = json.getBytes(StandardCharsets.UTF_8);
        String sig = calculateSignature(payload);

        User user = User.builder().id(5L).plan(User.Plan.PRO).kaspiCustomerId("kaspi_cus_123").build();
        when(userRepository.findByKaspiCustomerId("kaspi_cus_123")).thenReturn(Optional.of(user));

        kaspiPayService.handleWebhook(payload, sig);

        assertThat(user.getPlan()).isEqualTo(User.Plan.FREE);
        verify(userRepository).save(user);
        verify(auditService).logAction(eq(5L), eq("BILLING_KASPI_PAYMENT_REFUNDED"), eq("kaspi_cus_123"), anyString(), isNull());
    }

    @Test
    @DisplayName("handleWebhook clears Redis idempotency key on unexpected processing error to allow retry")
    void testHandleWebhook_ErrorClearsRedisLock() throws Exception {
        String json = "{\"status\":\"COMPLETED\",\"orderId\":\"999_1\",\"amount\":15000,\"currency\":\"KZT\",\"txnId\":\"txn_err\"}";
        byte[] payload = json.getBytes(StandardCharsets.UTF_8);
        String sig = calculateSignature(payload);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> kaspiPayService.handleWebhook(payload, sig))
                .isInstanceOf(NotFoundException.class);

        verify(redisTemplate).delete("kaspi:webhook:txn_err");
    }
}
