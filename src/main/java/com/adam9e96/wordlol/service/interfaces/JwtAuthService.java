package com.adam9e96.wordlol.service.interfaces;

import com.adam9e96.wordlol.dto.common.TokenInfo;

/**
 * JWT 인증 관련 서비스 인터페이스
 */
public interface JwtAuthService {

    /**
     * OAuth 로그인 사용자를 위한 JWT 토큰 생성
     *
     * @param email 사용자 이메일
     * @return JWT 토큰 정보
     */
    TokenInfo createTokenForOAuthUser(String email);

    /**
     * 리프레시 토큰을 이용해 새로운 액세스 토큰 발급
     *
     * @param refreshToken 리프레시 토큰
     * @return 새로운 JWT 토큰 정보
     */
    TokenInfo refreshToken(String refreshToken);

    /**
     * 토큰에서 사용자 이메일 추출
     *
     * @param token JWT 토큰
     * @return 사용자 이메일
     */
    String getUserEmailFromToken(String token);
}
