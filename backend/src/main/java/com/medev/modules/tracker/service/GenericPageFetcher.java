package com.medev.modules.tracker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

import java.net.URI;

/**
 * SRP component for securely fetching HTML documents and text with timeout,
 * max response size, and strict redirect validation.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GenericPageFetcher {

    private final UrlSecurityValidator urlSecurityValidator;

    private static final int TIMEOUT_MILLIS = 8000;
    private static final int MAX_BODY_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
    private static final int MAX_REDIRECTS = 3;
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    /**
     * Securely fetches and parses an HTML document from the target URL.
     * Validates each hop in redirect chains against SSRF restrictions.
     *
     * @param url The target URL
     * @return Parsed Document, or null if network failure occurred
     * @throws IllegalArgumentException if URL or redirect target violates security policy
     */
    public Document fetchDocument(String url) {
        String currentUrl = url;
        int redirects = 0;
        try {
            while (redirects <= MAX_REDIRECTS) {
                urlSecurityValidator.validateUrl(currentUrl);

                org.jsoup.Connection.Response response = Jsoup.connect(currentUrl)
                        .userAgent(USER_AGENT)
                        .header("Accept-Language", "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7")
                        .timeout(TIMEOUT_MILLIS)
                        .maxBodySize(MAX_BODY_SIZE_BYTES)
                        .followRedirects(false)
                        .execute();

                int statusCode = response.statusCode();
                if (statusCode >= 300 && statusCode < 400) {
                    String location = response.header("Location");
                    if (location == null || location.isBlank()) {
                        break;
                    }
                    URI baseUri = URI.create(currentUrl);
                    currentUrl = baseUri.resolve(location).toString();
                    redirects++;
                    continue;
                }
                return response.parse();
            }
            return null;
        } catch (IllegalArgumentException e) {
            log.warn("Security validation blocked URL in fetcher: {} - {}", sanitizeUrlForLogging(currentUrl), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.warn("Direct connection failed for {}: {}", sanitizeUrlForLogging(url), e.getMessage());
            return null;
        }
    }

    /**
     * Fetches plain text from the target URL.
     *
     * @param url The target URL
     * @return Extracted text content
     * @throws IllegalArgumentException if security validation fails
     */
    public String fetchText(String url) {
        Document doc = fetchDocument(url);
        if (doc == null || doc.body() == null) {
            return "";
        }
        return doc.body().text();
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
