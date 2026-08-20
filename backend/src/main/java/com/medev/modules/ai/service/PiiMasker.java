package com.medev.modules.ai.service;

import org.springframework.stereotype.Component;

@Component
public class PiiMasker {
    
    public String mask(String text) {
        if (text == null) return null;
        
        return text
            // Emails
            .replaceAll("(?i)\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b", "[EMAIL]")
            // SSN & 12-digit national IDs (IIN/BIN)
            .replaceAll("\\b\\d{3}-\\d{2}-\\d{4}\\b|\\b\\d{12}\\b", "[ID_NUMBER]")
            // International phone numbers (covers Kazakh, Russian, US, EU formats)
            .replaceAll("(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{2,4}[-.\\s]?\\d{2,4}", "[PHONE]")
            // Names with apostrophes and hyphens (e.g. O'Connor, Jean-Luc)
            .replaceAll("\\b[A-ZА-Я][a-zа-яA-ZА-Я'’\\-]+ [A-ZА-Я][a-zа-яA-ZА-Я'’\\-]+(?: [A-ZА-Я][a-zа-яA-ZА-Я'’\\-]+)?\\b", "[NAME]");
    }
}
