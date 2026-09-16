package com.medev.modules.tracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.tracker.dto.CreateJobApplicationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * SRP client for fetching and parsing HeadHunter (hh.ru / hh.kz) vacancies via the official public API.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HhVacancyClient {

    private final ObjectMapper objectMapper;

    private static final Pattern HH_VACANCY_PATTERN = Pattern.compile("(?:hh\\.kz|hh\\.ru|headhunter\\.kz|headhunter\\.ru)/vacancy/([0-9]+)");

    /**
     * Checks if the given URL matches a known HeadHunter vacancy URL pattern.
     */
    public boolean isHhUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        return HH_VACANCY_PATTERN.matcher(url).find();
    }

    /**
     * Extracts vacancy ID from a HeadHunter URL, or null if not matched.
     */
    public String extractVacancyId(String url) {
        if (url == null) return null;
        Matcher matcher = HH_VACANCY_PATTERN.matcher(url);
        return matcher.find() ? matcher.group(1) : null;
    }

    /**
     * Fetches vacancy metadata from https://api.hh.ru/vacancies/{id} and populates the request DTO.
     *
     * @param vacancyId The HH vacancy ID
     * @param request   The target DTO to populate
     * @return true if successfully extracted, false otherwise
     */
    public boolean extractFromApi(String vacancyId, CreateJobApplicationRequest request) {
        if (vacancyId == null || vacancyId.isBlank()) {
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "MeDev-Platform/1.0 (support@medev.kz)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String apiUrl = "https://api.hh.ru/vacancies/" + vacancyId;
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());

                if (root.hasNonNull("name")) {
                    request.setRole(root.get("name").asText());
                }

                if (root.hasNonNull("employer") && root.get("employer").hasNonNull("name")) {
                    request.setCompanyName(root.get("employer").get("name").asText());
                }

                if (root.hasNonNull("area") && root.get("area").hasNonNull("name")) {
                    request.setLocation(root.get("area").get("name").asText());
                }

                if (root.hasNonNull("salary")) {
                    JsonNode salaryNode = root.get("salary");
                    StringBuilder sb = new StringBuilder();
                    if (salaryNode.hasNonNull("from")) {
                        sb.append("от ").append(salaryNode.get("from").asText());
                    }
                    if (salaryNode.hasNonNull("to")) {
                        if (sb.length() > 0) sb.append(" ");
                        sb.append("до ").append(salaryNode.get("to").asText());
                    }
                    if (salaryNode.hasNonNull("currency")) {
                        sb.append(" ").append(salaryNode.get("currency").asText());
                    }
                    if (sb.length() > 0) {
                        request.setSalaryRange(sb.toString());
                    }
                }

                if (root.hasNonNull("description")) {
                    String rawHtml = root.get("description").asText();
                    String cleanText = Jsoup.parse(rawHtml).text();

                    if (root.hasNonNull("key_skills") && root.get("key_skills").isArray()) {
                        StringBuilder skills = new StringBuilder();
                        for (JsonNode skill : root.get("key_skills")) {
                            if (skill.hasNonNull("name")) {
                                if (skills.length() > 0) skills.append(", ");
                                skills.append(skill.get("name").asText());
                            }
                        }
                        if (skills.length() > 0) {
                            cleanText += "\n\nКлючевые навыки: " + skills;
                        }
                    }
                    request.setJobDescription(cleanText);
                }

                return true;
            }
        } catch (Exception e) {
            log.warn("HH API call failed for vacancy {}: {}", vacancyId, e.getMessage());
        }
        return false;
    }
}
