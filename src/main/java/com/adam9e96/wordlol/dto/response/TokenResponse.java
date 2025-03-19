package com.adam9e96.wordlol.dto.response;

/**
 * JWT 토큰 응답 DTO
 *
 * @param tokenType
 * @param accessToken
 * @param refreshToken
 */
public record TokenResponse(
        String tokenType,
        String accessToken,
        String refreshToken
) {
}
