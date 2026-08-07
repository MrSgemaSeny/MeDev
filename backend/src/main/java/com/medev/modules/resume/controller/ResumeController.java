package com.medev.modules.resume.controller;

import com.medev.modules.resume.dto.ParsedResumeDto;
import com.medev.modules.resume.service.PdfGeneratorService;
import com.medev.modules.resume.service.PdfParserService;
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
    private final PdfParserService pdfParserService;

    @GetMapping("/generate/{template}")
    public ResponseEntity<byte[]> generate(@PathVariable String template) {
        Long userId = SecurityUtils.getCurrentUserId();
        byte[] pdf = pdfGeneratorService.generatePdf(userId, template);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=resume.pdf")
                .body(pdf);
    }

    @PostMapping("/parse")
    public ResponseEntity<ParsedResumeDto> parseResume(@RequestParam("file") MultipartFile file) {
        ParsedResumeDto parsed = pdfParserService.parse(file);
        return ResponseEntity.ok(parsed);
    }

    @PostMapping("/import")
    public ResponseEntity<Void> importParsed(@RequestBody ParsedResumeDto parsed) {
        Long userId = SecurityUtils.getCurrentUserId();
        pdfParserService.importToProfile(userId, parsed);
        return ResponseEntity.noContent().build();
    }
}
