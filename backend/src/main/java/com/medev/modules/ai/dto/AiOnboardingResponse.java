package com.medev.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;

@Data
public class AiOnboardingResponse {
    
    @NotBlank(message = "Bio cannot be empty")
    private String bio;
    
    @NotBlank(message = "Headline cannot be empty")
    private String headline;

    @NotNull(message = "Skills list cannot be null")
    @Size(min = 1, message = "At least one skill is required")
    private List<SkillDto> skills;

    @NotNull(message = "Experience list cannot be null")
    @Size(min = 1, message = "At least one experience is required")
    private List<ExperienceDto> experiences;

    @Data
    public static class SkillDto {
        @NotBlank
        private String name;
        @NotBlank
        private String category;
    }

    @Data
    public static class ExperienceDto {
        @NotBlank
        private String company;
        @NotBlank
        private String position;
        @NotNull
        private JsonNode description;

        public String getParsedDescription() {
            if (description == null) return "";
            if (description.isArray()) {
                List<String> list = new java.util.ArrayList<>();
                for (JsonNode node : description) {
                    list.add("- " + node.asText());
                }
                return String.join("\n", list);
            }
            return description.asText();
        }
    }
}
