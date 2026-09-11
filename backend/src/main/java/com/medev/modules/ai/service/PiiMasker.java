package com.medev.modules.ai.service;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Component
public class PiiMasker {

    // 1. Email pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "(?i)\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b"
    );

    // 2. SSN and 12-digit National IDs (IIN/BIN)
    private static final Pattern ID_PATTERN = Pattern.compile(
            "\\b\\d{3}-\\d{2}-\\d{4}\\b|\\b\\d{12}\\b"
    );

    // 3. Specific international and regional phone numbers (avoids matching dates YYYY-MM-DD or software versions)
    // - International starting with + (e.g. +7 777 123 45 67, +1-555-123-4567, +44 20 7946 0958)
    // - CIS/KZ/RU format starting with 8 (e.g. 87011234567, 8 (701) 123-45-67)
    // - Formats with explicit parentheses (e.g. (777) 123-45-67, (555) 123-4567)
    // - US 10-digit standard format (e.g. 555-123-4567)
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(?:\\+\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{2,4}[-.\\s]?\\d{2,4}"
    );

    // Date and version guard pattern to avoid false-positive phone masking
    private static final Pattern ISO_DATE_PATTERN = Pattern.compile(
            "\\b\\d{4}[-/.](?:0[1-9]|1[0-2])[-/.](?:0[1-9]|[12]\\d|3[01])\\b"
    );

    public String mask(String text) {
        if (text == null) return null;

        // Mask Emails
        String result = EMAIL_PATTERN.matcher(text).replaceAll("[EMAIL]");

        // Mask National IDs / SSN
        result = ID_PATTERN.matcher(result).replaceAll("[ID_NUMBER]");

        // Mask Phones safely:
        // We match candidate phone strings, verify they are not ISO dates (e.g., 2022-09-01) or version strings (e.g., 3.11.2)
        Matcher matcher = PHONE_PATTERN.matcher(result);
        StringBuilder sb = new StringBuilder(result.length());
        while (matcher.find()) {
            String candidate = matcher.group();
            // Guard against ISO dates (2022-09-01, 1999/12/31) and short version numbers
            if (isDateOrVersion(candidate)) {
                matcher.appendReplacement(sb, Matcher.quoteReplacement(candidate));
            } else if (candidate.replaceAll("\\D", "").length() >= 7) {
                // Legitimate phone number has at least 7 digits
                matcher.appendReplacement(sb, "[PHONE]");
            } else {
                matcher.appendReplacement(sb, Matcher.quoteReplacement(candidate));
            }
        }
        matcher.appendTail(sb);

        return sb.toString();
    }

    private boolean isDateOrVersion(String str) {
        // Year-Month-Day pattern: e.g. 2024-05-12 or 2020.01.01
        if (ISO_DATE_PATTERN.matcher(str).matches()) {
            return true;
        }
        // Year range pattern: 2020 - 2024
        if (str.matches("^\\d{4}\\s*[-–—]\\s*\\d{4}$")) {
            return true;
        }
        // Version string: 3.3.0 or 17.0.1
        if (str.matches("^\\d+\\.\\d+(\\.\\d+)+$")) {
            return true;
        }
        return false;
    }
}
