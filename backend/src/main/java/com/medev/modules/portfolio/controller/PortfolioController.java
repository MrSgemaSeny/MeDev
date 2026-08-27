package com.medev.modules.portfolio.controller;

import com.medev.modules.portfolio.dto.PublicProfileDto;
import com.medev.modules.portfolio.service.PortfolioService;
import com.medev.shared.security.PublicRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final PublicRateLimiter publicRateLimiter;

    @GetMapping("/{username}")
    public ResponseEntity<PublicProfileDto> getPublicProfile(
            @PathVariable String username,
            HttpServletRequest request) {
        publicRateLimiter.checkAndConsume(request.getRemoteAddr(), "portfolio");
        PublicProfileDto profile = portfolioService.getPublicProfile(username);
        return ResponseEntity.ok(profile);
    }
}
