package com.adam9e96.wordlol.dto;

import java.time.LocalDateTime;

public record WordBookStudyResponse(
        Long id,
        String vocabulary,
        String meaning,
        String hint,
        Integer difficulty,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public WordBookStudyResponse(Long id, String vocabulary, String meaning, String hint, Integer difficulty) {
        this(id, vocabulary, meaning, hint, difficulty, null, null);
    }
}
