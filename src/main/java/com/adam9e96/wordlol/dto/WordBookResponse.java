package com.adam9e96.wordlol.dto;

import com.adam9e96.wordlol.entity.Category;

import java.time.LocalDateTime;

// 단어장 응답 DTO
public record WordBookResponse(
        Long id,
        String name,
        String description,
        Category category,
        int wordCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
