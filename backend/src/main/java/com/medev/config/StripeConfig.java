package com.medev.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {

    @Value("${stripe.secret-key:sk_test_12345}")
    private String stripeApiKey;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @PostConstruct
    public void init() {
        if ("prod".equalsIgnoreCase(activeProfile) && (stripeApiKey == null || stripeApiKey.isBlank() || "sk_test_12345".equals(stripeApiKey))) {
            throw new IllegalStateException("Production Stripe API/Secret key cannot be empty or default dummy key!");
        }
        Stripe.apiKey = stripeApiKey;
    }
}
