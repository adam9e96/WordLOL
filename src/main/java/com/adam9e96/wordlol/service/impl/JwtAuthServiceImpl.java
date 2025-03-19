package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.dto.common.TokenInfo;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import com.adam9e96.wordlol.service.interfaces.JwtAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtAuthServiceImpl implements JwtAuthService {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public TokenInfo createTokenForOAuthUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다: " + email));

        // JWT 토큰 생성
        return jwtTokenProvider.createTokenFromEmail(email, user.getRole());
    }

    @Override
    @Transactional(readOnly = true)
    public TokenInfo refreshToken(String refreshToken) {
        // 리프레시 토큰 유효성 검사
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        try {
            // 토큰에서 이메일 추출
            String email = jwtTokenProvider.getEmailFromToken(refreshToken);

            // 사용자 정보 조회
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다: " + email));

            // 새로운 액세스 토큰 생성 (리프레시 토큰은 갱신하지 않음)
            return jwtTokenProvider.createTokenFromEmail(email, user.getRole());
        } catch (Exception e) {
            log.error("토큰 리프레시 중 오류 발생", e);
            throw new IllegalArgumentException("토큰 갱신에 실패했습니다: " + e.getMessage());
        }
    }


    @Override
    @Transactional(readOnly = true)
    public String getUserEmailFromToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }

        return jwtTokenProvider.getEmailFromToken(token);
    }

}
