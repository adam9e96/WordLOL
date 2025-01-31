package com.adam9e96.WordLOL.dto;

import java.time.LocalDateTime;

public record WordResponse(
        Long id,
        String vocabulary,
        String meaning,
        String hint,
        Integer difficulty,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

