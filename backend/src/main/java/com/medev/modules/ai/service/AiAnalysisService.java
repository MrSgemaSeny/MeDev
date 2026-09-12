package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.dto.*;
import com.medev.modules.ai.model.LlmException;
import com.medev.modules.profile.dto.ProfileDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final LlmProvider llmProvider;
    private final PromptLoader promptLoader;
    private final ObjectMapper objectMapper;
    private final PiiMasker piiMasker;

    private static final int MAX_RESUME_TEXT_CHARS = 15000;
    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    private static final int MAX_PDF_PAGES = 30;

    /**
     * Extracts text from uploaded PDF resume, masks PII, prompts LLM, and parses into AiParsedResumeDto.
     */
    public AiParsedResumeDto parseResumePdf(MultipartFile file, ProfileDto currentProfile) {
        String pdfText = extractTextFromPdf(file);
        String normalizedText = smartNormalizePdfText(pdfText);

        String systemPrompt = getResumeParserPrompt();
        String currentProfileJson = "{}";
        try {
            if (currentProfile != null) {
                currentProfileJson = objectMapper.writeValueAsString(currentProfile);
            }
        } catch (Exception e) {
            log.warn("Failed to serialize current profile", e);
        }

        // A3: Mask PII from both user's uploaded PDF and current database profile
        String maskedPdfText = piiMasker.mask(normalizedText);
        String maskedProfileJson = piiMasker.mask(currentProfileJson);

        String finalPrompt = "CURRENT PROFILE JSON (FROM GITHUB/DB):\n" + maskedProfileJson + "\n\n" +
                             "<user_resume>\n" + maskedPdfText + "\n</user_resume>";

        String jsonResponse;
        try {
            jsonResponse = llmProvider.structuredCompletion(systemPrompt, finalPrompt);
        } catch (LlmException e) {
            throw e;
        } catch (Exception e) {
            log.error("LLM provider call failed during resume parsing: {}", e.getMessage());
            throw new LlmException(
                    LlmException.Reason.PROVIDER_UNAVAILABLE,
                    "AI generation failed: " + e.getMessage(), e);
        }

        String cleaned = GroqClient.extractJson(jsonResponse);
        try {
            return objectMapper.readValue(cleaned, AiParsedResumeDto.class);
        } catch (Exception primaryEx) {
            try {
                String sanitized = cleaned
                        .replaceAll("(?s)<think>.*?</think>", "")
                        .replaceAll(",\\s*([}\\]])", "$1")
                        .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "")
                        .trim();
                sanitized = GroqClient.extractJson(sanitized);
                return objectMapper.readValue(sanitized, AiParsedResumeDto.class);
            } catch (Exception secondaryEx) {
                String preview = cleaned != null ? cleaned.substring(0, Math.min(cleaned.length(), 300)) : "null";
                log.error("Failed to parse JSON from AI resume parser. Raw preview: {}", preview, primaryEx);
                throw new LlmException(
                        LlmException.Reason.INVALID_RESPONSE,
                        "AI generation returned invalid format: " + primaryEx.getMessage(), primaryEx);
            }
        }
    }

    /**
     * B1: Centralized PDF validation and extraction logic.
     */
    public String extractTextFromPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл не передан или пуст");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Размер файла превышает максимально допустимый (10 МБ)");
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        boolean isPdfMime = contentType != null && (contentType.equalsIgnoreCase("application/pdf") || contentType.equalsIgnoreCase("application/x-pdf"));
        boolean isPdfExt = filename != null && filename.toLowerCase().endsWith(".pdf");

        if (!isPdfMime && !isPdfExt) {
            throw new IllegalArgumentException("Поддерживаются только файлы в формате PDF");
        }

        try {
            byte[] fileBytes = file.getBytes();
            if (fileBytes.length < 4 || fileBytes[0] != '%' || fileBytes[1] != 'P' || fileBytes[2] != 'D' || fileBytes[3] != 'F') {
                throw new IllegalArgumentException("Файл поврежден или не является корректным PDF");
            }
            try (PDDocument document = Loader.loadPDF(fileBytes)) {
                if (document.getNumberOfPages() > MAX_PDF_PAGES) {
                    throw new IllegalArgumentException("PDF превышает максимально допустимый объем (30 страниц)");
                }
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                if (text == null || text.trim().isEmpty()) {
                    throw new IllegalArgumentException("Загруженный PDF не содержит текстового слоя (например, скан или картинка). Пожалуйста, загрузите PDF с выделяемым текстом.");
                }
                return text;
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse PDF document: {}", e.getMessage());
            throw new IllegalArgumentException("Не удалось прочитать загруженный PDF файл. Убедитесь, что файл не защищен паролем и содержит текстовый слой.", e);
        }
    }

    /**
     * A2: Smart text normalization & truncation preserving section boundaries.
     */
    private String smartNormalizePdfText(String raw) {
        if (raw == null) return "";

        // Remove null bytes and non-printable control chars
        String cleaned = raw.replace("\u0000", "")
                .replaceAll("[\\r\\t]+", " ")
                .replaceAll(" {2,}", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();

        if (cleaned.length() <= MAX_RESUME_TEXT_CHARS) {
            return cleaned;
        }

        // Intelligently find last paragraph boundary before character limit
        int cutIndex = cleaned.lastIndexOf("\n\n", MAX_RESUME_TEXT_CHARS);
        if (cutIndex < MAX_RESUME_TEXT_CHARS / 2) {
            cutIndex = cleaned.lastIndexOf("\n", MAX_RESUME_TEXT_CHARS);
        }
        if (cutIndex < MAX_RESUME_TEXT_CHARS / 2) {
            cutIndex = cleaned.lastIndexOf(". ", MAX_RESUME_TEXT_CHARS);
        }
        if (cutIndex < MAX_RESUME_TEXT_CHARS / 2) {
            cutIndex = MAX_RESUME_TEXT_CHARS;
        }

        return cleaned.substring(0, cutIndex).trim();
    }

    private String getResumeParserPrompt() {
        try {
            return promptLoader.load("resume_parser_v2");
        } catch (Exception e) {
            log.warn("Prompt resume_parser_v2 not found, falling back to v1: {}", e.getMessage());
            return promptLoader.load("resume_parser_v1");
        }
    }

    public AiParsedResumeDto generateFullProfile(Long userId, String githubSnapshotJson, ProfileDto currentProfile) {
        String systemPrompt = promptLoader.load("full_profile_generator_v1");
        String currentProfileJson = "{}";
        try {
            currentProfileJson = objectMapper.writeValueAsString(currentProfile);
        } catch (Exception e) {
            log.warn("Failed to serialize current profile", e);
        }

        String maskedProfileJson = piiMasker.mask(currentProfileJson);
        String maskedGithubJson = piiMasker.mask(githubSnapshotJson != null ? githubSnapshotJson : "{}");
        String finalPrompt = "CURRENT PROFILE JSON (CONTAINS ONBOARDING DATA):\n" + maskedProfileJson + "\n\n" +
                             "GITHUB SNAPSHOT JSON:\n" + maskedGithubJson;

        try {
            String jsonResponse = llmProvider.structuredCompletion(systemPrompt, finalPrompt);
            String cleaned = GroqClient.extractJson(jsonResponse);
            return objectMapper.readValue(cleaned, AiParsedResumeDto.class);
        } catch (Exception e) {
            log.error("Failed to generate full profile via AI, falling back to existing profile state: {}", e.getMessage());
            return buildFallbackParsedProfile(currentProfile);
        }
    }

    /**
     * B5: Clean and type-safe fallback profile builder.
     */
    private AiParsedResumeDto buildFallbackParsedProfile(ProfileDto current) {
        if (current == null) {
            return new AiParsedResumeDto();
        }
        AiParsedResumeDto fallback = new AiParsedResumeDto();
        fallback.setFullName(current.getFullName());
        fallback.setHeadline(current.getHeadline());
        fallback.setSummary(current.getSummary());
        fallback.setLocation(current.getLocation());
        fallback.setWebsite(current.getWebsite());
        fallback.setGithubUsername(current.getGithubUsername());
        fallback.setTelegram(current.getTelegram());
        fallback.setLinkedin(current.getLinkedin());

        if (current.getSkills() != null) {
            fallback.setSkills(current.getSkills().stream()
                    .map(s -> {
                        AiSkillDto dto = new AiSkillDto();
                        dto.setName(s.getName());
                        return dto;
                    }).collect(Collectors.toList()));
        }

        if (current.getExperience() != null) {
            fallback.setExperience(current.getExperience().stream()
                    .map(exp -> {
                        AiExperienceDto dto = new AiExperienceDto();
                        dto.setCompany(exp.getCompany());
                        dto.setPosition(exp.getPosition());
                        dto.setDescription(exp.getDescription());
                        dto.setTechStack(exp.getTechStack());
                        dto.setStartDate(exp.getStartDate() != null ? exp.getStartDate().toString() : null);
                        dto.setEndDate(exp.getEndDate() != null ? exp.getEndDate().toString() : null);
                        dto.setIsCurrent(exp.getIsCurrent());
                        return dto;
                    }).collect(Collectors.toList()));
        }

        if (current.getEducation() != null) {
            fallback.setEducation(current.getEducation().stream()
                    .map(edu -> {
                        AiEducationDto dto = new AiEducationDto();
                        dto.setInstitution(edu.getInstitution());
                        dto.setDegree(edu.getDegree());
                        dto.setFieldOfStudy(edu.getField());
                        dto.setStartDate(edu.getStartDate() != null ? edu.getStartDate().toString() : null);
                        dto.setEndDate(edu.getEndDate() != null ? edu.getEndDate().toString() : null);
                        return dto;
                    }).collect(Collectors.toList()));
        }

        if (current.getProjects() != null) {
            fallback.setProjects(current.getProjects().stream()
                    .map(p -> {
                        AiProjectDto dto = new AiProjectDto();
                        dto.setName(p.getName());
                        dto.setDescription(p.getDescription());
                        dto.setGithubUrl(p.getGithubUrl());
                        dto.setTechStack(p.getTechStack());
                        return dto;
                    }).collect(Collectors.toList()));
        }

        return fallback;
    }
}
