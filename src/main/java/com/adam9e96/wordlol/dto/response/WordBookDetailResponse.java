package com.adam9e96.wordlol.dto.response;

import com.adam9e96.wordlol.enums.Category;

import java.time.LocalDateTime;

/**
 * WordBookDetailResponse
 * 단어장 상세 정보 응답 DTO
 * <p>
 * book_edit.js 에서 사용
 *
 * @param id
 * @param name
 * @param description
 * @param category
 * @param createdAt
 * @param updatedAt
 */
public record WordBookDetailResponse(
        Long id,
        String name,
        String description,
        Category category,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

