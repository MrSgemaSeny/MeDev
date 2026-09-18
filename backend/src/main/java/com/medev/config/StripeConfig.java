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
        if (stripeApiKey == null || stripeApiKey.isBlank() || "sk_test_12345".equals(stripeApiKey)) {
            org.slf4j.LoggerFactory.getLogger(StripeConfig.class).warn("Stripe API key is not configured or using default test key. Stripe billing operations will be disabled.");
        } else {
            Stripe.apiKey = stripeApiKey;
        }
    }
}
