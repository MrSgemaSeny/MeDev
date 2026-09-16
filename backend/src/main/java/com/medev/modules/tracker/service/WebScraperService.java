package com.medev.modules.tracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.service.LlmProvider;
import com.medev.modules.tracker.dto.CreateJobApplicationRequest;
import com.medev.modules.tracker.entity.ApplicationStatus;
import com.medev.shared.exception.TooManyRequestsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.net.URI;

/**
 * Clean coordinator for job vacancy web scraping operations.
 * Coordinates URL security validation, rate limiting, specialized clients (HH API),
 * generic HTML fetching, DOM extraction, and AI extraction fallbacks.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class WebScraperService {

    private final UrlSecurityValidator urlSecurityValidator;
    private final ScrapeRateLimiter scrapeRateLimiter;
    private final HhVacancyClient hhVacancyClient;
    private final GenericPageFetcher genericPageFetcher;
    private final AiJobExtractor aiJobExtractor;

    /**
     * Backward-compatibility constructor for unit tests and legacy callers.
     */
    public WebScraperService(
            StringRedisTemplate redisTemplate,
            LlmProvider llmProvider,
            ObjectMapper objectMapper,
            UrlSecurityValidator validator
    ) {
        this(
                validator,
                new ScrapeRateLimiter(redisTemplate),
                new HhVacancyClient(objectMapper),
                new GenericPageFetcher(validator),
                new AiJobExtractor(llmProvider, objectMapper)
        );
    }

    public CreateJobApplicationRequest scrapeJobUrl(String url) {
        if (url == null || url.isBlank()) {
            CreateJobApplicationRequest req = new CreateJobApplicationRequest();
            req.setStatus(ApplicationStatus.WISHLIST);
            req.setAppliedDate(java.time.LocalDate.now());
            return req;
        }

        String targetUrl = url.trim();
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = "https://" + targetUrl;
        }

        CreateJobApplicationRequest request = new CreateJobApplicationRequest();
        request.setJobUrl(targetUrl);
        request.setStatus(ApplicationStatus.WISHLIST);
        request.setAppliedDate(java.time.LocalDate.now());

        try {
            // 1. Validate security boundaries (SSRF defense)
            urlSecurityValidator.validateUrl(targetUrl);

            // 2. Enforce rate limiting
            scrapeRateLimiter.checkRateLimit(targetUrl);

            // 3. Try specialized HeadHunter API client if HH vacancy
            if (hhVacancyClient.isHhUrl(targetUrl)) {
                String vacancyId = hhVacancyClient.extractVacancyId(targetUrl);
                if (vacancyId != null) {
                    boolean hhSuccess = hhVacancyClient.extractFromApi(vacancyId, request);
                    if (hhSuccess && isExtracted(request)) {
                        log.info("Successfully extracted HH vacancy {} via HH API client", vacancyId);
                        return request;
                    }
                }
            }

            // 4. Fetch HTML document via generic fetcher
            Document doc = genericPageFetcher.fetchDocument(targetUrl);
            if (doc != null) {
                if (targetUrl.contains("hh.kz") || targetUrl.contains("hh.ru")) {
                    extractHhKz(doc, request);
                } else if (targetUrl.contains("linkedin.com")) {
                    extractLinkedIn(doc, request);
                } else if (targetUrl.contains("habr.com")) {
                    extractHabr(doc, request);
                }

                if (isExtracted(request)) {
                    log.info("Successfully extracted job details via DOM selectors for: {}", sanitizeUrlForLogging(targetUrl));
                    return request;
                }

                // 5. Fallback to AI structured extraction from visible text
                if (doc.body() != null) {
                    String bodyText = doc.body().text();
                    if (bodyText != null && !bodyText.isBlank()) {
                        aiJobExtractor.extractWithAi(bodyText, request);
                    }
                }
            }

        } catch (TooManyRequestsException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Scraping error for url {}: {}", sanitizeUrlForLogging(targetUrl), e.getMessage());
        }

        return request;
    }

    private boolean isExtracted(CreateJobApplicationRequest req) {
        return req.getRole() != null && !req.getRole().isBlank() &&
               req.getCompanyName() != null && !req.getCompanyName().isBlank();
    }

    private void extractHhKz(Document doc, CreateJobApplicationRequest request) {
        Element titleEl = doc.selectFirst("h1[data-qa='vacancy-title'], h1.bloko-header-section-1");
        if (titleEl != null) request.setRole(titleEl.text().trim());

        Element companyEl = doc.selectFirst("a[data-qa='vacancy-company-name'], span[data-qa='vacancy-company-name']");
        if (companyEl != null) request.setCompanyName(companyEl.text().trim());

        Element salaryEl = doc.selectFirst("span[data-qa='vacancy-salary-compensation-type-net'], span[data-qa='vacancy-salary-compensation-type-gross'], [data-qa='vacancy-salary']");
        if (salaryEl != null) request.setSalaryRange(salaryEl.text().trim());

        Element locationEl = doc.selectFirst("p[data-qa='vacancy-view-location'], [data-qa='vacancy-view-raw-address']");
        if (locationEl != null) request.setLocation(locationEl.text().trim());

        Element descEl = doc.selectFirst("div[data-qa='vacancy-description'], .g-user-content");
        if (descEl != null) request.setJobDescription(descEl.text().trim());
    }

    private void extractLinkedIn(Document doc, CreateJobApplicationRequest request) {
        Element titleEl = doc.selectFirst(".top-card-layout__title, .topcard__title, h1");
        if (titleEl != null) request.setRole(titleEl.text().trim());

        Element companyEl = doc.selectFirst(".topcard__org-name-link, .top-card-layout__first-sub-headline, a.topcard__org-name-link");
        if (companyEl != null) request.setCompanyName(companyEl.text().trim());

        Element locationEl = doc.selectFirst(".topcard__flavor--bullet, .top-card-layout__second-sub-headline");
        if (locationEl != null) request.setLocation(locationEl.text().trim());

        Element descEl = doc.selectFirst(".show-more-less-html__markup, .decorated-job-posting__details");
        if (descEl != null) request.setJobDescription(descEl.text().trim());
    }

    private void extractHabr(Document doc, CreateJobApplicationRequest request) {
        Element titleEl = doc.selectFirst(".page-title__title, .vacancy-title");
        if (titleEl != null) request.setRole(titleEl.text().trim());

        Element companyEl = doc.selectFirst(".vacancy-company__title, .company_name");
        if (companyEl != null) request.setCompanyName(companyEl.text().trim());

        Element salaryEl = doc.selectFirst(".vacancy-card__salary, .basic-salary");
        if (salaryEl != null) request.setSalaryRange(salaryEl.text().trim());

        Element locationEl = doc.selectFirst(".vacancy-company__location");
        if (locationEl != null) request.setLocation(locationEl.text().trim());

        Element descEl = doc.selectFirst(".vacancy-description__text, .style-ugc");
        if (descEl != null) request.setJobDescription(descEl.text().trim());
    }

    private String sanitizeUrlForLogging(String url) {
        if (url == null) return "null";
        try {
            URI uri = new URI(url);
            return new URI(uri.getScheme(), uri.getAuthority(), uri.getPath(), null, null).toString();
        } catch (Exception e) {
            int qIndex = url.indexOf('?');
            return qIndex != -1 ? url.substring(0, qIndex) : url;
        }
    }
}
