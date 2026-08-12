package com.medev.modules.ai.service;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WebScraperService {

    /**
     * Extracts text content from a given URL.
     * @param url The URL of the job posting or article.
     * @return The extracted text.
     */
    public String extractTextFromUrl(String url) {
        try {
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
}
