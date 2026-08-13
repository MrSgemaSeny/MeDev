package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ReorderRequest {
    @NotNull
    @jakarta.validation.constraints.Size(max = 100, message = "Cannot reorder more than 100 items at once")
    private List<Long> ids;
}
