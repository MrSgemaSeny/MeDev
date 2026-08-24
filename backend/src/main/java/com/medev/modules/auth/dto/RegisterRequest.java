package com.medev.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank
    @Size(min = 3, max = 50)
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9_.-]{3,50}$", message = "Username may only contain letters, digits, underscores, dots, or hyphens")
    private String username;
}
