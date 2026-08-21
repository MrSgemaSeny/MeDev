package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.dto.AiParsedResumeDto;
import com.medev.modules.profile.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final LlmProvider llmProvider;
    private final PromptLoader promptLoader;
    private final ObjectMapper objectMapper;
    private final PiiMasker piiMasker;

    public AiParsedResumeDto parseResumePdf(MultipartFile file, com.medev.modules.profile.dto.ProfileDto currentProfile) {
        String pdfText = extractTextFromPdf(file);
        
        // Ограничиваем размер текста, чтобы не превысить лимиты (например 10000 символов)
        if (pdfText.length() > 10000) {
            pdfText = pdfText.substring(0, 10000);
        }

        String systemPrompt = promptLoader.load("resume_parser_v1");
        String currentProfileJson = "{}";
        try {
            currentProfileJson = objectMapper.writeValueAsString(currentProfile);
        } catch (Exception e) {
            log.warn("Failed to serialize current profile", e);
        }

        String maskedPdfText = piiMasker.mask(pdfText);

        String finalPrompt = "CURRENT PROFILE JSON (FROM GITHUB/DB):\n" + currentProfileJson + "\n\n" +
                             "<user_resume>\n" + maskedPdfText + "\n</user_resume>";

        String jsonResponse = llmProvider.structuredCompletion(systemPrompt, finalPrompt);
        
        try {
            String cleaned = GroqClient.extractJson(jsonResponse);
            return objectMapper.readValue(cleaned, AiParsedResumeDto.class);
        } catch (Exception e) {
            log.error("Failed to parse Groq response: {}", jsonResponse, e);
            throw new RuntimeException("AI generation failed or returned invalid format. Aborting to prevent data loss.", e);
        }
    }

    private String extractTextFromPdf(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
        
        try {
            byte[] fileBytes = file.getBytes();
            if (fileBytes.length < 4 || fileBytes[0] != '%' || fileBytes[1] != 'P' || fileBytes[2] != 'D' || fileBytes[3] != 'F') {
                throw new IllegalArgumentException("Invalid PDF magic bytes");
            }
            try (PDDocument document = Loader.loadPDF(fileBytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read PDF file", e);
        }
    }

    public AiParsedResumeDto generateFullProfile(Long userId, String githubSnapshotJson, com.medev.modules.profile.dto.ProfileDto currentProfile) {
        String systemPrompt = promptLoader.load("full_profile_generator_v1");
        String currentProfileJson = "{}";
        try {
            currentProfileJson = objectMapper.writeValueAsString(currentProfile);
        } catch (Exception e) {
            log.warn("Failed to serialize current profile", e);
        }

        String finalPrompt = "CURRENT PROFILE JSON (CONTAINS ONBOARDING DATA):\n" + currentProfileJson + "\n\n" +
                             "GITHUB SNAPSHOT JSON:\n" + (githubSnapshotJson != null ? githubSnapshotJson : "{}");

        String jsonResponse = llmProvider.structuredCompletion(systemPrompt, finalPrompt);
        
        try {
            String cleaned = GroqClient.extractJson(jsonResponse);
            return objectMapper.readValue(cleaned, AiParsedResumeDto.class);
        } catch (Exception e) {
            log.error("Failed to parse Groq response: {}", jsonResponse, e);
            throw new RuntimeException("AI generation failed or returned invalid format. Aborting to prevent data loss.", e);
        }
    }
}
