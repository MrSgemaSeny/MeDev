package com.medev.modules.ai.service;

import com.medev.modules.tracker.service.GenericPageFetcher;
import com.medev.modules.tracker.service.UrlSecurityValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;

/**
 * AI module scraper service that delegates fetching and URL security validation
 * to the core SRP tracker scraper components.
 */
@Service("aiWebScraperService")
@Slf4j
public class WebScraperService {

    private final GenericPageFetcher genericPageFetcher;
    private final UrlSecurityValidator urlSecurityValidator;

    public WebScraperService(GenericPageFetcher genericPageFetcher, UrlSecurityValidator urlSecurityValidator) {
        this.genericPageFetcher = genericPageFetcher;
        this.urlSecurityValidator = urlSecurityValidator;
    }

    public WebScraperService(UrlSecurityValidator urlSecurityValidator) {
        this(new GenericPageFetcher(urlSecurityValidator), urlSecurityValidator);
    }

    /**
     * Extracts text content from a given URL safely.
     *
     * @param url The URL of the job posting or article.
     * @return The extracted text.
     */
    public String extractTextFromUrl(String url) {
        try {
            urlSecurityValidator.validateUrl(url);
            String text = genericPageFetcher.fetchText(url);
            if (text == null || text.isBlank()) {
                throw new RuntimeException("Failed to fetch content from the provided URL. Please copy-paste the text manually.");
            }
            return text;
        } catch (IllegalArgumentException e) {
            log.warn("Security validation blocked URL in AI scraper: {} - {}", sanitizeUrlForLogging(url), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Failed to scrape URL in AI scraper: {}", sanitizeUrlForLogging(url), e);
            throw new RuntimeException("Failed to fetch content from the provided URL. Please copy-paste the text manually.");
        }
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
