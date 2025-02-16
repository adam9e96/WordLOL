package com.adam9e96.wordlol.dto;

import com.adam9e96.wordlol.entity.Category;

import java.time.LocalDateTime;

/**
 * WordBookDetailResponse
 * 단어장 상세 정보 응답 DTO
 * <p>
 * wordbook-edit.js 에서 사용
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

