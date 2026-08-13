package com.medev.modules.tracker.service;

import com.medev.modules.tracker.dto.CreateJobApplicationRequest;
import com.medev.modules.tracker.entity.ApplicationStatus;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.Set;

@Service
@Slf4j
public class WebScraperService {

    private static final Set<String> ALLOWED_HOSTS = Set.of(
            "hh.kz", "hh.ru", "linkedin.com", "www.linkedin.com",
            "indeed.com", "www.indeed.com", "career.habr.com"
    );

    public CreateJobApplicationRequest scrapeJobUrl(String url) {
        CreateJobApplicationRequest request = new CreateJobApplicationRequest();
        request.setJobUrl(url);
        request.setStatus(ApplicationStatus.WISHLIST);
        request.setAppliedDate(java.time.LocalDate.now());

        try {
            validateUrl(url);

            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
                    .timeout(10000)
                    .get();

            // Generic fallback extraction
            String title = doc.title();
            request.setRole(title != null ? title.split(" - ")[0].trim() : "Unknown Role");
            request.setCompanyName("Unknown Company");

            // Extract HH.kz specific details if it's hh.kz / hh.ru
            if (url.contains("hh.kz") || url.contains("hh.ru")) {
                extractHhKz(doc, request);
            } else if (url.contains("linkedin.com")) {
                extractLinkedIn(doc, request);
            } else {
                // Fallback for job description: grab the body text and take first 2000 chars
                String bodyText = doc.body().text();
                request.setJobDescription(bodyText.substring(0, Math.min(bodyText.length(), 2000)));
            }
        } catch (IOException e) {
            log.error("Failed to scrape job url: {}", url, e);
            request.setRole("Manual Entry Required");
            request.setCompanyName("Failed to scrape");
            request.setNotes("Could not fetch details from URL: " + e.getMessage());
        }

        return request;
    }

    private void extractHhKz(Document doc, CreateJobApplicationRequest request) {
        Element titleEl = doc.selectFirst("h1[data-qa='vacancy-title']");
        if (titleEl != null) request.setRole(titleEl.text());

        Element companyEl = doc.selectFirst("a[data-qa='vacancy-company-name']");
        if (companyEl != null) request.setCompanyName(companyEl.text());
        else {
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
