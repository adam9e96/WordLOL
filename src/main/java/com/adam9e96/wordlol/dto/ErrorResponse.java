package com.adam9e96.wordlol.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 에러 응답 DTO
 *
 * @param timestamp
 * @param status
 * @param message
 * @param errors
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        Integer status,
        String message,
        List<String> errors
) {
}
