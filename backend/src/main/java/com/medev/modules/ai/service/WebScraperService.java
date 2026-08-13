package com.medev.modules.ai.service;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.Set;

@Service("aiWebScraperService")
@Slf4j
public class WebScraperService {

    private static final Set<String> ALLOWED_HOSTS = Set.of(
            "hh.kz", "hh.ru", "linkedin.com", "www.linkedin.com",
            "indeed.com", "www.indeed.com", "career.habr.com"
    );

    /**
     * Extracts text content from a given URL.
     * @param url The URL of the job posting or article.
     * @return The extracted text.
     */
    public String extractTextFromUrl(String url) {
        try {
            validateUrl(url);

            log.info("Scraping URL: {}", url);
            // We use a common User-Agent to avoid basic bot blocking
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(10000)
                    .get();

            // Return the visible text, removing HTML tags
            return doc.body().text();
        } catch (Exception e) {
            log.error("Failed to scrape URL: {}", url, e);
            throw new RuntimeException("Failed to fetch content from the provided URL. Please copy-paste the text manually.");
        }
    }

    private void validateUrl(String url) {
        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme();
            String host = uri.getHost();

            if (!"https".equalsIgnoreCase(scheme)) {
                throw new IllegalArgumentException("Only HTTPS URLs are allowed");
            }
            if (host == null || !ALLOWED_HOSTS.contains(host.toLowerCase())) {
                throw new IllegalArgumentException("URL host is not allowed: " + host);
            }
            
            InetAddress addr = InetAddress.getByName(host);
            if (addr.isLoopbackAddress() || addr.isSiteLocalAddress() || addr.isLinkLocalAddress()) {
                throw new IllegalArgumentException("Private/loopback addresses are not allowed");
            }
        } catch (URISyntaxException | UnknownHostException e) {
            throw new IllegalArgumentException("Invalid URL format");
        }
    }
}
