package com.medev.modules.admin.controller;

import com.medev.modules.admin.dto.AdminDashboardDto;
import com.medev.modules.admin.service.AdminService;
import com.medev.modules.audit.entity.AuditLog;
import com.medev.modules.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getAllUsers(PageRequest.of(page, size)));
    }

    @PutMapping("/users/{userId}/plan")
    public ResponseEntity<Void> changeUserPlan(
            @PathVariable Long userId,
            @RequestParam User.Plan plan) {
        adminService.updateUserPlan(userId, plan);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Void> changeUserRole(
            @PathVariable Long userId,
            @RequestParam User.Role role) {
        adminService.updateUserRole(userId, role);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/audit")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(adminService.getAuditLogs(PageRequest.of(page, size)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}
