package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ReorderRequest {
    @NotNull(message = "Ids list cannot be null")
    @jakarta.validation.constraints.Size(max = 100, message = "Cannot reorder more than 100 items at once")
    private List<@NotNull(message = "Item ID cannot be null") Long> ids;
}
