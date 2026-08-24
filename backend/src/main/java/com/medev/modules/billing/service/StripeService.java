package com.medev.modules.billing.service;

import com.medev.modules.audit.service.AuditService;
import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.NotFoundException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {

    private final UserRepository userRepository;
    private final org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;
    private final AuditService auditService;

    @Value("${stripe.pro-price-id}")
    private String proPriceId;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${stripe.secret-key:sk_test_12345}")
    private String stripeApiKey;

    public String createCheckoutSession(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getPlan() == User.Plan.PRO) {
            throw new IllegalStateException("User is already on PRO plan");
        }

        try {
            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setSuccessUrl(frontendUrl + "/billing/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/billing/cancel")
                    .setCustomerEmail(user.getEmail())
                    .putMetadata("userId", String.valueOf(user.getId()))
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPrice(proPriceId)
                                    .build()
                    );

            Session session = Session.create(paramsBuilder.build());
            auditService.logAction(userId, "BILLING_STRIPE_CHECKOUT_INITIATED", String.valueOf(userId), "Stripe checkout session initiated", null);
            return session.getUrl();
        } catch (StripeException e) {
            log.error("Failed to create Stripe Checkout Session for user {}", userId, e);
            throw new RuntimeException("Billing service unavailable");
        }
    }

    public String getUserPlan(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        return user.getPlan().name();
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Stripe webhook signature verification failed", e);
            throw new IllegalArgumentException("Invalid signature");
        } catch (Exception e) {
            log.error("Failed to parse Stripe webhook", e);
            throw new IllegalArgumentException("Invalid payload");
        }

        String eventId = event.getId();
        String idempotencyKey = "stripe:webhook:" + eventId;
        
        // Idempotency check with Redis (grace period: 24h)
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(idempotencyKey, "PROCESSED", java.time.Duration.ofHours(24));
        if (Boolean.FALSE.equals(isNew)) {
            log.info("Stripe webhook event {} already processed, skipping", eventId);
            return;
        }

        try {
            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    handleSuccessfulCheckout(session);
                }
            } else if ("customer.subscription.deleted".equals(event.getType())) {
                com.stripe.model.Subscription subscription = (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
                if (subscription != null) {
                    downgradeUser(subscription.getCustomer());
                }
            } else if ("customer.subscription.updated".equals(event.getType())) {
                com.stripe.model.Subscription subscription = (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
                if (subscription != null) {
                    String status = subscription.getStatus();
                    if ("canceled".equals(status) || "unpaid".equals(status) || "past_due".equals(status)) {
                        downgradeUser(subscription.getCustomer());
                    } else if ("active".equals(status)) {
                        upgradeUserByCustomer(subscription.getCustomer());
                    }
                }
            } else if ("invoice.payment_failed".equals(event.getType())) {
                com.stripe.model.Invoice invoice = (com.stripe.model.Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
                if (invoice != null) {
                    downgradeUser(invoice.getCustomer());
                }
            }
        } catch (Exception e) {
            redisTemplate.delete(idempotencyKey);
            log.error("Error processing Stripe webhook event {}, cleared idempotency key for retry", eventId, e);
            throw e;
        }
    }

    private void handleSuccessfulCheckout(Session session) {
        String userIdStr = session.getMetadata().get("userId");
        if (userIdStr != null) {
            Long userId = Long.parseLong(userIdStr);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User not found: " + userId));

            user.setPlan(User.Plan.PRO);
            user.setStripeCustomerId(session.getCustomer());
            userRepository.save(user);
            redisTemplate.delete("user_plan:" + userId);
            
            log.info("Successfully upgraded user {} to PRO", userId);
            auditService.logAction(userId, "BILLING_STRIPE_PAYMENT_SUCCESS", session.getCustomer(), "Upgraded to PRO via Stripe Checkout session " + session.getId(), null);
        } else {
            log.warn("Checkout session {} completed but no userId in metadata", session.getId());
        }
    }

    private void downgradeUser(String customerId) {
        userRepository.findByStripeCustomerId(customerId).ifPresent(user -> {
            user.setPlan(User.Plan.FREE);
            userRepository.save(user);
            redisTemplate.delete("user_plan:" + user.getId());
            log.info("Downgraded user {} to FREE plan", user.getId());
            auditService.logAction(user.getId(), "BILLING_STRIPE_SUBSCRIPTION_DOWNGRADE", customerId, "Downgraded to FREE plan via Stripe", null);
        });
    }

    private void upgradeUserByCustomer(String customerId) {
        userRepository.findByStripeCustomerId(customerId).ifPresent(user -> {
            user.setPlan(User.Plan.PRO);
            userRepository.save(user);
            redisTemplate.delete("user_plan:" + user.getId());
            log.info("Upgraded user {} to PRO plan via subscription update", user.getId());
            auditService.logAction(user.getId(), "BILLING_STRIPE_SUBSCRIPTION_RENEWAL", customerId, "Upgraded to PRO plan via Stripe subscription update", null);
        });
    }
}
