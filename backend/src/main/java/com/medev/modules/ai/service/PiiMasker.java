package com.medev.modules.ai.service;

import org.springframework.stereotype.Component;

@Component
public class PiiMasker {
    
    public String mask(String text) {
        if (text == null) return null;
        
        return text
            // Phone numbers
            .replaceAll("\\+?[0-9][\\s\\-]?\\(?[0-9]{3}\\)?[\\s\\-]?[0-9]{3}[\\s\\-]?[0-9]{2}[\\s\\-]?[0-9]{2}", "[PHONE]")
            // Emails
            .replaceAll("[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}", "[EMAIL]")
            // Basic full names (2-3 words capitalized)
            .replaceAll("\\b[A-ZА-Я][a-zа-я]+ [A-ZА-Я][a-zа-я]+(?: [A-ZА-Я][a-zа-я]+)?\\b", "[NAME]");
    }
}
