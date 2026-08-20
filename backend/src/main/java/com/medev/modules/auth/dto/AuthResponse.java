package com.medev.modules.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String refreshToken;
    private String username;
    private String plan;
    private String role;
}
