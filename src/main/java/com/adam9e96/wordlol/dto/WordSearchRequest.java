package com.adam9e96.wordlol.dto;

import java.time.LocalDateTime;

/**
 * 단어 검색 요청 DTO
 * @param keyword
 * @param difficulty
 * @param startDate
 * @param endDate
 */
public record WordSearchRequest(
        String keyword,
        Integer difficulty,
        LocalDateTime startDate,
        LocalDateTime endDate
) {
}
