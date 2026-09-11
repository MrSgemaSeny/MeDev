package com.medev.modules.tracker.service;

import com.medev.modules.tracker.dto.CreateJobApplicationRequest;
import com.medev.modules.tracker.entity.ApplicationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.time.Duration;
import java.util.Set;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.service.LlmProvider;

import com.medev.shared.security.SecurityUtils;
import com.medev.shared.exception.TooManyRequestsException;

@Service
@Slf4j
@RequiredArgsConstructor
public class WebScraperService {

    private final RedisTemplate<String, Object> redisTemplate;

    private final LlmProvider llmProvider;
    private final ObjectMapper objectMapper;

    private static final Set<String> ALLOWED_HOSTS = Set.of(
            "hh.kz", "hh.ru", "linkedin.com", "www.linkedin.com",
            "indeed.com", "www.indeed.com", "career.habr.com"
    );

    public CreateJobApplicationRequest scrapeJobUrl(String url) {
        String normalizedHost = validateUrl(url);
        enforceRateLimit();

        CreateJobApplicationRequest request = new CreateJobApplicationRequest();
        request.setJobUrl(url);
        request.setStatus(ApplicationStatus.WISHLIST);
        request.setAppliedDate(java.time.LocalDate.now());

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            String jinaUrl = "https://r.jina.ai/" + url;
            org.springframework.http.ResponseEntity<String> response = restTemplate.exchange(
                    jinaUrl,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    String.class
            );

            String markdown = response.getBody();
            if (markdown != null && !markdown.isEmpty()) {
                String systemPrompt = "Extract job vacancy details from the following markdown text into a strict JSON object. " +
                        "Use the following keys: 'role' (string, job title), 'companyName' (string), 'location' (string, optional), 'salaryRange' (string, optional), 'jobDescription' (string, full cleaned job description text). " +
                        "Output ONLY valid JSON. If something is not found, leave it as null.";
                
                String textToParse = markdown.substring(0, Math.min(markdown.length(), 20000));
                
                String jsonResponse = llmProvider.structuredCompletion(systemPrompt, textToParse);
                String cleaned = com.medev.modules.ai.service.GroqClient.extractJson(jsonResponse);
                
                com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(cleaned);
                if (root.hasNonNull("role")) request.setRole(root.get("role").asText());
                if (root.hasNonNull("companyName")) request.setCompanyName(root.get("companyName").asText());
                if (root.hasNonNull("location")) request.setLocation(root.get("location").asText());
                if (root.hasNonNull("salaryRange")) request.setSalaryRange(root.get("salaryRange").asText());
                if (root.hasNonNull("jobDescription")) request.setJobDescription(root.get("jobDescription").asText());
            }

            if (request.getRole() == null) request.setRole("Manual Entry Required");
            if (request.getCompanyName() == null) request.setCompanyName("Unknown Company");

        } catch (Exception e) {
            log.error("Failed to scrape job url with AI: {}", url, e);
            request.setRole("Manual Entry Required");
            request.setCompanyName("Unknown");
            request.setNotes("Could not automatically fetch job details. Please fill in manually.");
        }

        return request;
    }

    private void enforceRateLimit() {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            if (userId == null || redisTemplate == null) {
                return;
            }
            String key = "rate:scrape:" + userId;
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1L) {
                redisTemplate.expire(key, Duration.ofMinutes(1));
            }
            if (count != null && count > 10) {
                throw new TooManyRequestsException("Too many scrape requests. Please wait a minute.");
            }
        } catch (TooManyRequestsException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Redis rate limit check failed for scraper, skipping: {}", e.getMessage());
        }
    }

    /**
     * Validates the URL: scheme must be HTTPS, host must be in ALLOW_LIST, IP must be public.
     *
     * @return normalized lowercase host string for use in dispatcher (avoids re-parsing)
     * @throws IllegalArgumentException if validation fails
     */
    private String validateUrl(String url) {
        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme();
            String host = uri.getHost();

            if (!"https".equalsIgnoreCase(scheme)) {
                throw new IllegalArgumentException("Only HTTPS URLs are allowed");
            }
            if (host == null) {
                throw new IllegalArgumentException("URL host is missing");
            }
            String normalizedHost = host.toLowerCase();
            if (!ALLOWED_HOSTS.contains(normalizedHost)) {
                throw new IllegalArgumentException("URL host is not in the allowed list: " + normalizedHost);
            }

            InetAddress addr = InetAddress.getByName(host);
            if (addr.isLoopbackAddress()
                    || addr.isSiteLocalAddress()
                    || addr.isLinkLocalAddress()
                    || addr.isAnyLocalAddress()
                    || "169.254.169.254".equals(addr.getHostAddress())) {
                throw new IllegalArgumentException("Private/loopback/cloud-metadata addresses are not allowed");
            }

            return normalizedHost;
        } catch (URISyntaxException | UnknownHostException e) {
            throw new IllegalArgumentException("Invalid URL format");
        }
    }

    private void extractHhKz(Document doc, CreateJobApplicationRequest request) {
        Element titleEl = doc.selectFirst("h1[data-qa='vacancy-title']");
        if (titleEl != null) request.setRole(titleEl.text());

        Element companyEl = doc.selectFirst("a[data-qa='vacancy-company-name']");
        if (companyEl != null) {
            request.setCompanyName(companyEl.text());
        } else {
            Element companyElSpan = doc.selectFirst("span[data-qa='vacancy-company-name']");
            if (companyElSpan != null) request.setCompanyName(companyElSpan.text());
        }

        Element salaryEl = doc.selectFirst("span[data-qa='vacancy-salary-compensation-type-net']");
        if (salaryEl == null) salaryEl = doc.selectFirst("span[data-qa='vacancy-salary-compensation-type-gross']");
        if (salaryEl != null) request.setSalaryRange(salaryEl.text());

        Element locationEl = doc.selectFirst("p[data-qa='vacancy-view-location']");
        if (locationEl != null) request.setLocation(locationEl.text());

        Element descEl = doc.selectFirst("div[data-qa='vacancy-description']");
        if (descEl != null) request.setJobDescription(descEl.text());
    }

    private void extractLinkedIn(Document doc, CreateJobApplicationRequest request) {
        Element titleEl = doc.selectFirst(".top-card-layout__title");
        if (titleEl != null) request.setRole(titleEl.text());

        Element companyEl = doc.selectFirst(".topcard__org-name-link");
        if (companyEl != null) request.setCompanyName(companyEl.text());

        Element locationEl = doc.selectFirst(".topcard__flavor--bullet");
        if (locationEl != null) request.setLocation(locationEl.text());

        Element descEl = doc.selectFirst(".show-more-less-html__markup");
        if (descEl != null) request.setJobDescription(descEl.text());
    }
}
