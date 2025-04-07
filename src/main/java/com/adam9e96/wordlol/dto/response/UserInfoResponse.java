package com.adam9e96.wordlol.dto.response;

/**
 * 사용자 정보 응답 DTO
 * JWT 토큰 기반 인증 시 사용자 정보를 반환하기 위한 DTO
 *
 * @param id 사용자 ID
 * @param email 사용자 이메일
 * @param name 사용자 이름
 * @param picture 프로필 사진 URL
 * @param role 사용자 권한
 */
public record UserInfoResponse(
        Long id,
        String email,
        String name,
        String picture,
        String role
) {
}