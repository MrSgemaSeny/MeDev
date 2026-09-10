package com.medev.modules.resume.controller;

import com.medev.modules.resume.service.PdfGeneratorService;
import com.medev.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/resume")
@RequiredArgsConstructor
public class ResumeController {

    private static final java.util.Set<String> ALLOWED_TEMPLATES = java.util.Set.of("apple-modern", "github", "grok-monolith", "milky-soft", "phub-orange", "clean");

    private final PdfGeneratorService pdfGeneratorService;
    private final com.medev.modules.auth.repository.UserRepository userRepository;

    @GetMapping("/generate/{template}")
    public ResponseEntity<byte[]> generate(@PathVariable String template, @RequestParam(defaultValue = "false") boolean preview, @RequestParam(defaultValue = "true") boolean singlePage) {
        Long userId = SecurityUtils.getCurrentUserId();
        
        if (!ALLOWED_TEMPLATES.contains(template)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid template name");
        }
        
        byte[] pdf = pdfGeneratorService.generatePdf(userId, template, preview, singlePage);

        String disposition = preview ? "inline" : "attachment";
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", disposition + "; filename=resume.pdf")
                .body(pdf);
    }

    @GetMapping(value = "/html/{template}", produces = "text/html;charset=UTF-8")
    public ResponseEntity<String> generateHtml(@PathVariable String template, @RequestParam(defaultValue = "false") boolean preview, @RequestParam(defaultValue = "true") boolean singlePage) {
        Long userId = SecurityUtils.getCurrentUserId();
        
        if (!ALLOWED_TEMPLATES.contains(template)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid template name");
        }
        
        String html = pdfGeneratorService.generateHtml(userId, template, preview, singlePage);

        String disposition = preview ? "inline" : "attachment";
        return ResponseEntity.ok()
                .header("Content-Disposition", disposition + "; filename=resume.html")
                .header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data: https:; sandbox;")
                .header("X-Content-Type-Options", "nosniff")
                .body(html);
    }
}
