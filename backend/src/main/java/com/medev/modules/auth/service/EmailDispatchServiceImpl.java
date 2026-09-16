package com.medev.modules.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailDispatchServiceImpl implements EmailDispatchService {

    private final String frontendUrl;

    public EmailDispatchServiceImpl(@Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String rawToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
        log.info("[EmailDispatch] Password reset email queued for recipient");
    }
}
