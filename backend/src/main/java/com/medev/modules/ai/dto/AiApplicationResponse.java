package com.medev.modules.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiApplicationResponse {
    private String content;

    @JsonProperty("coverLetter")
    public String getCoverLetter() {
        return content;
    }

    @JsonProperty("suggestions")
    public String getSuggestions() {
        return content;
    }
}

