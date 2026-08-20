package com.medev.modules.billing.controller;

import com.medev.modules.billing.service.KaspiPayService;
import com.medev.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/v1/billing/kaspi")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "kaspi.enabled", havingValue = "true", matchIfMissing = false)
public class KaspiBillingController {

    private final KaspiPayService kaspiPayService;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createKaspiCheckoutSession(@RequestParam(defaultValue = "1") int months) {
        Long userId = SecurityUtils.getCurrentUserId();
        String checkoutUrl = kaspiPayService.createPaymentLink(userId, months);
        return ResponseEntity.ok(Map.of("url", checkoutUrl));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleKaspiWebhook(
            @RequestBody byte[] rawPayload,
            @RequestHeader(value = "X-Kaspi-Signature", required = false) String sigHeader) {
        
        try {
            kaspiPayService.handleWebhook(rawPayload, sigHeader);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
    }
}
