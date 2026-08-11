package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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

    public UpdateProfileRequest parseResumePdf(MultipartFile file) {
        String pdfText = extractTextFromPdf(file);
        
        // Ограничиваем размер текста, чтобы не превысить лимиты (например 10000 символов)
        if (pdfText.length() > 10000) {
            pdfText = pdfText.substring(0, 10000);
        }

        String systemPrompt = promptLoader.load("resume_parser_v1.txt");

        String jsonResponse = llmProvider.structuredCompletion(systemPrompt, pdfText);
        
        try {
            if (jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.substring(7);
            }
            if (jsonResponse.startsWith("```")) {
                jsonResponse = jsonResponse.substring(3);
            }
            if (jsonResponse.endsWith("```")) {
                jsonResponse = jsonResponse.substring(0, jsonResponse.length() - 3);
            }
            jsonResponse = jsonResponse.trim();
            
            return objectMapper.readValue(jsonResponse, UpdateProfileRequest.class);
        } catch (Exception e) {
            log.error("Failed to parse Groq response: {}", jsonResponse, e);
            return new UpdateProfileRequest(); // Graceful degradation
        }
    }

    private String extractTextFromPdf(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read PDF file", e);
        }
    }
}
