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
    public ResponseEntity<byte[]> generate(@PathVariable String template, @RequestParam(defaultValue = "false") boolean preview) {
        Long userId = SecurityUtils.getCurrentUserId();
        
        // Ensure user is PRO if they request pro templates
        if (template.toLowerCase().contains("pro")) {
            throw new com.medev.shared.exception.UnauthorizedException("PRO template requires PRO plan");
        }
        
        byte[] pdf = pdfGeneratorService.generatePdf(userId, template);

        String disposition = preview ? "inline" : "attachment";
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", disposition + "; filename=resume.pdf")
                .body(pdf);
    }

    @GetMapping(value = "/html/{template}", produces = "text/html;charset=UTF-8")
    public ResponseEntity<String> generateHtml(@PathVariable String template, @RequestParam(defaultValue = "false") boolean preview) {
        Long userId = SecurityUtils.getCurrentUserId();
        
        if (template.toLowerCase().contains("pro")) {
            throw new com.medev.shared.exception.UnauthorizedException("PRO template requires PRO plan");
        }
        
        String html = pdfGeneratorService.generateHtml(userId, template);

        String disposition = preview ? "inline" : "attachment";
        return ResponseEntity.ok()
                .header("Content-Disposition", disposition + "; filename=resume.html")
                .body(html);
    }
}
