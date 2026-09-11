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

import com.medev.shared.security.SecurityUtils;
import com.medev.shared.exception.TooManyRequestsException;

@Service
@Slf4j
@RequiredArgsConstructor
public class WebScraperService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final Set<String> ALLOWED_HOSTS = Set.of(
            "hh.kz", "hh.ru", "linkedin.com", "www.linkedin.com",
            "indeed.com", "www.indeed.com", "career.habr.com"
    );

    private static final Set<String> HH_HOSTS = Set.of("hh.kz", "hh.ru");

    public CreateJobApplicationRequest scrapeJobUrl(String url) {
        // A1: validate URL first — invalid URLs must not consume the rate-limit quota
        String normalizedHost = validateUrl(url);

        // Rate-limit by userId after URL is confirmed valid
        enforceRateLimit();

        CreateJobApplicationRequest request = new CreateJobApplicationRequest();
        request.setJobUrl(url);
        request.setStatus(ApplicationStatus.WISHLIST);
        request.setAppliedDate(java.time.LocalDate.now());

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
                    .maxBodySize(2 * 1024 * 1024)
                    .timeout(4000)
                    .followRedirects(false) // prevent redirect-based SSRF after DNS validation
                    .get();

            // Generic fallback extraction
            String title = doc.title();
            request.setRole(title != null ? title.split(" - ")[0].trim() : "Unknown Role");
            request.setCompanyName("Unknown Company");

            // B1: dispatch by parsed URI host, not by substring match on raw URL
            if (HH_HOSTS.contains(normalizedHost)) {
                extractHhKz(doc, request);
            } else if (normalizedHost.contains("linkedin.com")) {
                extractLinkedIn(doc, request);
            } else {
                String bodyText = doc.body().text();
                request.setJobDescription(bodyText.substring(0, Math.min(bodyText.length(), 2000)));
            }

            // Sanitize job description to prevent Stored XSS
            if (request.getJobDescription() != null) {
                request.setJobDescription(Jsoup.clean(request.getJobDescription(), org.jsoup.safety.Safelist.none()));
            }
        } catch (Exception e) {
            // A2: never expose e.getMessage() — may contain internal paths, DB hosts, etc.
            log.error("Failed to scrape job url: {}", url, e);
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
