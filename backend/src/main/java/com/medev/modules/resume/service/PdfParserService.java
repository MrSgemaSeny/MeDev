package com.medev.modules.resume.service;

import com.medev.modules.resume.dto.ParsedResumeDto;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PdfParserService {

    public ParsedResumeDto parse(MultipartFile file) {
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();

            return ParsedResumeDto.builder()
                    .rawText(text)
                    .email(extractEmail(text))
                    .phone(extractPhone(text))
                    .name(extractName(text))
                    .skills(new ArrayList<>()) // Simplified for now
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("PDF parsing failed", e);
        }
    }

    private String extractEmail(String text) {
        Pattern pattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group() : null;
    }

    private String extractPhone(String text) {
        Pattern pattern = Pattern.compile("\\+?[0-9]{10,13}");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group() : null;
    }

    private String extractName(String text) {
        // Very simplified heuristic: first non-empty line
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            if (!line.trim().isEmpty() && line.trim().length() > 2) {
                return line.trim();
            }
        }
        return null;
    }
    
    public void importToProfile(Long userId, ParsedResumeDto parsed) {
        // This will be handled in Phase 3 or implemented via ProfileService
        // For now, it's just a placeholder as per lifecycle doc
    }
}
