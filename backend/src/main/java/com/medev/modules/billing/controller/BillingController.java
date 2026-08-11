package com.medev.modules.billing.controller;

import com.medev.modules.billing.service.StripeService;
import com.medev.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final StripeService stripeService;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession() {
        Long userId = SecurityUtils.getCurrentUserId();
        String checkoutUrl = stripeService.createCheckoutSession(userId);
        return ResponseEntity.ok(Map.of("url", checkoutUrl));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        stripeService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}
