package com.medev.modules.resume.controller;

import com.medev.modules.resume.service.PdfGeneratorService;
import com.medev.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/resume")
@RequiredArgsConstructor
public class ResumeController {

    private static final java.util.Set<String> ALLOWED_TEMPLATES = java.util.Set.of("apple-modern", "github", "grok-monolith", "milky-soft", "phub-orange", "clean");
    private static final java.util.Set<String> PRO_TEMPLATES = java.util.Set.of("apple-modern", "milky-soft", "phub-orange");

    private final PdfGeneratorService pdfGeneratorService;
    private final com.medev.modules.auth.repository.UserRepository userRepository;
    @GetMapping("/generate/{template}")
    public ResponseEntity<byte[]> generate(@PathVariable String template, @RequestParam(defaultValue = "false") boolean preview, @RequestParam(defaultValue = "true") boolean singlePage) {
        Long userId = SecurityUtils.getCurrentUserId();
        
        if (!ALLOWED_TEMPLATES.contains(template)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid template name");
        }
        
        if (PRO_TEMPLATES.contains(template)) {
            com.medev.modules.auth.entity.User user = userRepository.findById(userId)
                    .orElseThrow(() -> new com.medev.shared.exception.NotFoundException("User not found"));
            if (user.getPlan() != com.medev.modules.auth.entity.User.Plan.PRO) {
                throw new com.medev.shared.exception.UnauthorizedException("PRO template requires PRO plan");
            }
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
        
        if (PRO_TEMPLATES.contains(template)) {
            com.medev.modules.auth.entity.User user = userRepository.findById(userId)
                    .orElseThrow(() -> new com.medev.shared.exception.NotFoundException("User not found"));
            if (user.getPlan() != com.medev.modules.auth.entity.User.Plan.PRO) {
                throw new com.medev.shared.exception.UnauthorizedException("PRO template requires PRO plan");
            }
        }        
        String html = pdfGeneratorService.generateHtml(userId, template, preview, singlePage);

        String disposition = preview ? "inline" : "attachment";
        return ResponseEntity.ok()
                .header("Content-Disposition", disposition + "; filename=resume.html")
                .body(html);
    }
}
