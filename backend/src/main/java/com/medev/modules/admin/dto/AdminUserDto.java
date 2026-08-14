package com.medev.modules.admin.dto;

import com.medev.modules.auth.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserDto {
    private Long id;
    private String email;
    private String username;
    private User.Role role;
    private User.Plan plan;
    private LocalDateTime subscriptionExpiresAt;
    private LocalDateTime createdAt;
    
    public static AdminUserDto fromEntity(User user) {
        return AdminUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .plan(user.getPlan())
                .subscriptionExpiresAt(user.getSubscriptionExpiresAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
