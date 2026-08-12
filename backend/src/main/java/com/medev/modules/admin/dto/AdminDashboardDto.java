package com.medev.modules.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardDto {
    private long totalUsers;
    private long activeProUsers;
    private long totalAiTokensUsedToday;
    private long totalAuditLogs;
}
