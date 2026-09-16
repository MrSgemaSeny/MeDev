package com.medev.modules.auth.service;

public interface EmailDispatchService {

    void sendPasswordResetEmail(String recipientEmail, String rawToken);
}
