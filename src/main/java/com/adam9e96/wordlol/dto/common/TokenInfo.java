package com.adam9e96.wordlol.dto.common;

import lombok.Builder;
import lombok.Getter;

/**
 * JWT 인증에 필요한 토큰 정보를 담는 DTO 클래스입니다.
 * 액세스 토큰과 리프레시 토큰을 포함합니다.
 */
@Getter
@Builder
public class TokenInfo {
    /**
     * 토큰 타입 (예: "Bearer")
     */
    private String grantType;

    /**
     * 사용자 인증에 사용되는 액세스 토큰
     */
    private String accessToken;

    /**
     * 액세스 토큰 갱신에 사용되는 리프레시 토큰
     */
    private String refreshToken;
}