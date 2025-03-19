package com.adam9e96.wordlol.dto.request;

/**
 * 리프레시 토큰을 이용한 액세스 토큰갱신 요청 DTO
 * @param refreshToken
 */
public record TokenRefreshRequest(
        String refreshToken
) {
}
