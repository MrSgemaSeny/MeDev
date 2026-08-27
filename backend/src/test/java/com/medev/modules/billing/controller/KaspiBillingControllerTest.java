package com.medev.modules.billing.controller;

import com.medev.modules.billing.service.KaspiPayService;
import com.medev.shared.security.JwtFilter;
import com.medev.shared.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(KaspiBillingController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = "kaspi.enabled=true")
class KaspiBillingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private KaspiPayService kaspiPayService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
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
    @DisplayName("POST /v1/billing/kaspi/checkout returns checkout url")
    void createKaspiCheckoutSession_returnsUrl() throws Exception {
        when(kaspiPayService.createPaymentLink(1L, 3)).thenReturn("https://pay.kaspi.kz/pay/merchant123?amount=40000");

        mockMvc.perform(post("/v1/billing/kaspi/checkout")
                        .param("months", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://pay.kaspi.kz/pay/merchant123?amount=40000"));

        verify(kaspiPayService).createPaymentLink(1L, 3);
    }

    @Test
    @DisplayName("POST /v1/billing/kaspi/webhook with valid signature returns 200 OK")
    void handleKaspiWebhook_validSignature_returnsOk() throws Exception {
        byte[] payload = "{\"status\":\"COMPLETED\"}".getBytes();

        mockMvc.perform(post("/v1/billing/kaspi/webhook")
                        .header("X-Kaspi-Signature", "valid-signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        verify(kaspiPayService).handleWebhook(any(byte[].class), eq("valid-signature"));
    }

    @Test
    @DisplayName("POST /v1/billing/kaspi/webhook with invalid signature returns 403 FORBIDDEN")
    void handleKaspiWebhook_invalidSignature_returnsForbidden() throws Exception {
        byte[] payload = "{\"status\":\"COMPLETED\"}".getBytes();
        doThrow(new IllegalArgumentException("Invalid Kaspi signature"))
                .when(kaspiPayService).handleWebhook(any(byte[].class), eq("bad-signature"));

        mockMvc.perform(post("/v1/billing/kaspi/webhook")
                        .header("X-Kaspi-Signature", "bad-signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden());

        verify(kaspiPayService).handleWebhook(any(byte[].class), eq("bad-signature"));
    }
}
