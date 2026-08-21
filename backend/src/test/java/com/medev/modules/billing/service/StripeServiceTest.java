package com.medev.modules.billing.service;

import com.medev.modules.auth.entity.User;
import com.medev.modules.auth.repository.UserRepository;
import com.medev.shared.exception.NotFoundException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;
    
    @Mock
    private org.springframework.data.redis.core.ValueOperations<String, Object> valueOperations;

    @Mock
    private com.medev.modules.audit.service.AuditService auditService;

    @InjectMocks
    private StripeService stripeService;

    private MockedStatic<Session> mockedSession;
    private MockedStatic<Webhook> mockedWebhook;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(valueOperations.setIfAbsent(anyString(), anyString(), any())).thenReturn(true);

        ReflectionTestUtils.setField(stripeService, "proPriceId", "price_test");
        ReflectionTestUtils.setField(stripeService, "webhookSecret", "whsec_test");
        ReflectionTestUtils.setField(stripeService, "frontendUrl", "http://localhost");

        mockedSession = mockStatic(Session.class);
        mockedWebhook = mockStatic(Webhook.class);
    }

    @AfterEach
    void tearDown() {
        mockedSession.close();
        mockedWebhook.close();
    }

    @Test
    void createCheckoutSession_happyPath() throws StripeException {
        User user = User.builder()
                .id(1L)
                .email("test@test.com")
                .plan(User.Plan.FREE)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Session mockSession = mock(Session.class);
        when(mockSession.getUrl()).thenReturn("https://checkout.stripe.com/test");
        
        mockedSession.when(() -> Session.create(any(SessionCreateParams.class))).thenReturn(mockSession);

        String url = stripeService.createCheckoutSession(1L);

        assertThat(url).isEqualTo("https://checkout.stripe.com/test");
        verify(auditService).logAction(eq(1L), eq("BILLING_STRIPE_CHECKOUT_INITIATED"), eq("1"), anyString(), isNull());
    }

    @Test
    void createCheckoutSession_alreadyPro_throwsException() {
        User user = User.builder()
                .id(1L)
                .email("test@test.com")
                .plan(User.Plan.PRO)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> stripeService.createCheckoutSession(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already on PRO plan");
    }

    @Test
    void handleWebhook_checkoutSessionCompleted_upgradesUser() throws Exception {
        String payload = "{}";
        String sigHeader = "sig";

        Event event = mock(Event.class);
        when(event.getId()).thenReturn("evt_123");
        when(event.getType()).thenReturn("checkout.session.completed");
        
        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        
        Session session = mock(Session.class);
        when(session.getId()).thenReturn("cs_123");
        when(deserializer.getObject()).thenReturn(Optional.of(session));
        
        when(session.getMetadata()).thenReturn(Map.of("userId", "1"));
        when(session.getCustomer()).thenReturn("cus_123");

        mockedWebhook.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString())).thenReturn(event);

        User user = User.builder().id(1L).plan(User.Plan.FREE).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        stripeService.handleWebhook(payload, sigHeader);

        assertThat(user.getPlan()).isEqualTo(User.Plan.PRO);
        assertThat(user.getStripeCustomerId()).isEqualTo("cus_123");
        verify(userRepository).save(user);
        verify(auditService).logAction(eq(1L), eq("BILLING_STRIPE_PAYMENT_SUCCESS"), eq("cus_123"), anyString(), isNull());
    }

    @Test
    void handleWebhook_alreadyProcessed_skipsExecution() throws Exception {
        String payload = "{}";
        String sigHeader = "sig";

        Event event = mock(Event.class);
        when(event.getId()).thenReturn("evt_already_done");
        mockedWebhook.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString())).thenReturn(event);

        when(valueOperations.setIfAbsent(eq("stripe:webhook:evt_already_done"), eq("PROCESSED"), any())).thenReturn(false);

        stripeService.handleWebhook(payload, sigHeader);

        verify(userRepository, never()).save(any());
    }

    @Test
    void handleWebhook_processingError_clearsRedisKeyForRetry() throws Exception {
        String payload = "{}";
        String sigHeader = "sig";

        Event event = mock(Event.class);
        when(event.getId()).thenReturn("evt_fail");
        when(event.getType()).thenReturn("checkout.session.completed");

        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

        Session session = mock(Session.class);
        when(deserializer.getObject()).thenReturn(Optional.of(session));
        when(session.getMetadata()).thenReturn(Map.of("userId", "999"));

        mockedWebhook.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString())).thenReturn(event);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stripeService.handleWebhook(payload, sigHeader))
                .isInstanceOf(NotFoundException.class);

        verify(redisTemplate).delete("stripe:webhook:evt_fail");
    }
}
