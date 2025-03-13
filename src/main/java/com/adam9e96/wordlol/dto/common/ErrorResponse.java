package com.adam9e96.wordlol.dto.common;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 에러 응답 DTO
 *
 * @param timestamp 에러 발생 시간
 * @param status    HTTP 상태 코드
 * @param message   에러 메시지
 * @param errors    에러 목록
 */
public record ErrorResponse(
        LocalDateTime timestamp,   // 에러 발생 시간
        Integer status,           // HTTP 상태 코드
        String message,           // 에러 메시지
        List<String> errors      // 상세 에러 목록
) {
}
