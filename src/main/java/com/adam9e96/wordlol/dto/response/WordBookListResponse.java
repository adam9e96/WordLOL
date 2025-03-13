package com.adam9e96.wordlol.dto.response;

import com.adam9e96.wordlol.enums.Category;

import java.time.LocalDateTime;

// 목록용 DTO
public record WordBookListResponse(
        Long id,
        String name,
        String description,
        Category category,
        int wordCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
