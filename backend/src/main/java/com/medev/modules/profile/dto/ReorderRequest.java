package com.medev.modules.profile.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ReorderRequest {
    @NotNull
    private List<Long> ids;
}
