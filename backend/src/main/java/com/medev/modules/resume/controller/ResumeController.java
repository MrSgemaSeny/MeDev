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

    private final PdfGeneratorService pdfGeneratorService;

    @GetMapping("/generate/{template}")
    public ResponseEntity<byte[]> generate(@PathVariable String template) {
        Long userId = SecurityUtils.getCurrentUserId();
        
        // Ensure user is PRO if they request pro templates
        if (template.toLowerCase().contains("pro")) {
            throw new com.medev.shared.exception.UnauthorizedException("PRO template requires PRO plan");
        }
        
        byte[] pdf = pdfGeneratorService.generatePdf(userId, template);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=resume.pdf")
                .body(pdf);
    }
}
