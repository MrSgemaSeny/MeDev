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

        String jsonResponse;
        try {
            jsonResponse = llmProvider.structuredCompletion(systemPrompt, finalPrompt);
        } catch (com.medev.modules.ai.model.LlmException e) {
            throw e;
        } catch (Exception e) {
            log.error("LLM provider call failed during resume parsing: {}", e.getMessage());
            throw new com.medev.modules.ai.model.LlmException(
                    com.medev.modules.ai.model.LlmException.Reason.PROVIDER_UNAVAILABLE,
                    "AI generation failed: " + e.getMessage(), e);
        }

        String cleaned = GroqClient.extractJson(jsonResponse);
        try {
            return objectMapper.readValue(cleaned, AiParsedResumeDto.class);
        } catch (Exception e) {
            log.error("Failed to parse JSON from AI resume parser: {}", e.getMessage());
            throw new com.medev.modules.ai.model.LlmException(
                    com.medev.modules.ai.model.LlmException.Reason.INVALID_RESPONSE,
                    "AI generation returned invalid format: " + e.getMessage(), e);
        }
    }

    private String extractTextFromPdf(MultipartFile file) {
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
                if (document.getNumberOfPages() > 30) {
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
        } catch (IOException e) {
            throw new IllegalArgumentException("Не удалось прочитать загруженный PDF файл", e);
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

        try {
            String jsonResponse = llmProvider.structuredCompletion(systemPrompt, finalPrompt);
            String cleaned = GroqClient.extractJson(jsonResponse);
            return objectMapper.readValue(cleaned, AiParsedResumeDto.class);
        } catch (Exception e) {
            log.error("Failed to generate full profile via AI, falling back to existing profile state: {}", e.getMessage());
            return buildFallbackParsedProfile(currentProfile);
        }
    }

    private AiParsedResumeDto buildFallbackParsedProfile(com.medev.modules.profile.dto.ProfileDto current) {
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
                        com.medev.modules.ai.dto.AiSkillDto dto = new com.medev.modules.ai.dto.AiSkillDto();
                        dto.setName(s.getName());
                        return dto;
                    }).collect(java.util.stream.Collectors.toList()));
        }

        if (current.getExperience() != null) {
            fallback.setExperience(current.getExperience().stream()
                    .map(exp -> {
                        com.medev.modules.ai.dto.AiExperienceDto dto = new com.medev.modules.ai.dto.AiExperienceDto();
                        dto.setCompany(exp.getCompany());
                        dto.setPosition(exp.getPosition());
                        dto.setDescription(exp.getDescription());
                        dto.setTechStack(exp.getTechStack());
                        dto.setStartDate(exp.getStartDate());
                        dto.setEndDate(exp.getEndDate());
                        dto.setIsCurrent(exp.getIsCurrent());
                        return dto;
                    }).collect(java.util.stream.Collectors.toList()));
        }

        if (current.getEducation() != null) {
            fallback.setEducation(current.getEducation().stream()
                    .map(edu -> {
                        com.medev.modules.ai.dto.AiEducationDto dto = new com.medev.modules.ai.dto.AiEducationDto();
                        dto.setInstitution(edu.getInstitution());
                        dto.setDegree(edu.getDegree());
                        dto.setFieldOfStudy(edu.getField());
                        dto.setStartDate(edu.getStartDate());
                        dto.setEndDate(edu.getEndDate());
                        return dto;
                    }).collect(java.util.stream.Collectors.toList()));
        }

        if (current.getProjects() != null) {
            fallback.setProjects(current.getProjects().stream()
                    .map(p -> {
                        com.medev.modules.ai.dto.AiProjectDto dto = new com.medev.modules.ai.dto.AiProjectDto();
                        dto.setName(p.getName());
                        dto.setDescription(p.getDescription());
                        dto.setGithubUrl(p.getGithubUrl());
                        dto.setTechStack(p.getTechStack());
                        return dto;
                    }).collect(java.util.stream.Collectors.toList()));
        }

        return fallback;
    }
}
