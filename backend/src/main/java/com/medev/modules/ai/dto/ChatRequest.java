package com.medev.modules.ai.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ChatRequest {
    private String prompt;
    private List<Map<String, String>> history;
}
