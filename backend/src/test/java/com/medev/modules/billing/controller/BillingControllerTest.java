package com.medev.modules.billing.controller;

import com.medev.modules.billing.service.StripeService;
import com.medev.shared.security.JwtFilter;
import com.medev.shared.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BillingController.class)
@AutoConfigureMockMvc(addFilters = false)
class BillingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StripeService stripeService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtFilter jwtFilter;

    @BeforeEach
    void setUp() {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("POST /v1/billing/checkout returns checkout url")
    void createCheckoutSession_returnsUrl() throws Exception {
        when(stripeService.createCheckoutSession(1L)).thenReturn("https://checkout.stripe.com/c/pay/cs_test_123");

        mockMvc.perform(post("/v1/billing/checkout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://checkout.stripe.com/c/pay/cs_test_123"));

        verify(stripeService).createCheckoutSession(1L);
    }

    @Test
    @DisplayName("GET /v1/billing/status returns user plan")
    void getBillingStatus_returnsPlan() throws Exception {
        when(stripeService.getUserPlan(1L)).thenReturn("PRO");

        mockMvc.perform(get("/v1/billing/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan").value("PRO"));

        verify(stripeService).getUserPlan(1L);
    }

    @Test
    @DisplayName("POST /v1/billing/webhook processes stripe webhook")
    void handleStripeWebhook_callsService() throws Exception {
        String payload = "{\"id\":\"evt_123\",\"type\":\"checkout.session.completed\"}";

        mockMvc.perform(post("/v1/billing/webhook")
                        .header("Stripe-Signature", "t=123,v1=signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        verify(stripeService).handleWebhook(payload, "t=123,v1=signature");
    }
}
