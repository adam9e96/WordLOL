package com.adam9e96.wordlol.config.security.oauth;

import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.dto.common.TokenInfo;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * OAuth2 로그인 성공 시 JWT 토큰을 발급하고 세션에 저장한 후 프론트엔드로 리다이렉션하는 핸들러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    // 로그인 성공 후 리다이렉션할 기본 URL @todo 상수클래스에서 불러와야됨
    private static final String DEFAULT_SUCCESS_URL = "/word/dashboard";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null) {
            log.error("OAuth 로그인 성공했지만 이메일 정보를 찾을 수 없습니다.");
            response.sendRedirect("/login?error=no_email");
            return;
        }

        try {
            log.info("OAuth 로그인 성공: {}", email);

            // 사용자 조회
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다: " + email));

            // JWT 토큰 생성 (이메일과 사용자 역할을 기반으로 생성)
            TokenInfo tokenInfo = jwtTokenProvider.createTokenFromEmail(email, user.getRole());

            // JWT 토큰을 HttpOnly 쿠키로 설정
            addTokenCookies(response, tokenInfo);

            log.info("JWT 토큰을 HttpOnly 쿠키로 설정 완료");

            // 홈페이지로 리다이렉트
            response.sendRedirect(DEFAULT_SUCCESS_URL);
        } catch (Exception e) {
            log.error("OAuth2 인증 성공 후 처리 중 오류 발생", e);
            response.sendRedirect("/login?error=login_failed&message=" + e.getMessage());
        }
    }

    // 토큰을 쿠키로 설정하는 메서드

    /**
     * 인증 토큰을 HTTP 응답에 쿠키로 설정하는 메서드
     *
     * @param response  HTTP 응답 객체
     * @param tokenInfo 액세스 토큰과 리프레시 토큰을 포함하는 객체
     *                  <p>
     *                  설정되는 쿠키:
     *                  1. access_token: 모든 API 요청 인증에 사용되는 단기 토큰 (1시간 유효)
     *                  - HttpOnly: true (JavaScript에서 접근 불가)
     *                  - Path: / (모든 경로에서 사용 가능)
     *                  - SameSite: Lax (크로스 사이트 요청 제한)
     *                  <p>
     *                  2. refresh_token: 액세스 토큰 갱신에 사용되는 장기 토큰 (30일 유효)
     *                  - HttpOnly: true (JavaScript에서 접근 불가)
     *                  - Path: /api/v1/auth/refresh (토큰 갱신 경로에서만 사용 가능)
     *                  - SameSite: Lax (크로스 사이트 요청 제한)
     */
    private void addTokenCookies(HttpServletResponse response, TokenInfo tokenInfo) {

        // Access Token 쿠키 설정
        Cookie accessTokenCookie = new Cookie("access_token", tokenInfo.getAccessToken());
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setPath("/"); // 모든 경로에서 접근 가능
        // HTTPS 환경에서만 secure=true 설정
        accessTokenCookie.setSecure(false); // 개발 환경에서는 false, 운영 환경에서는 true 로 변경(http -> https)
        // XSS 방어를 위한 SameSite 설정
        accessTokenCookie.setAttribute("SameSite", "Lax");
        // 액세스 토큰 만료 시간 설정 (초 단위)
        accessTokenCookie.setMaxAge(3600); // 1시간
        response.addCookie(accessTokenCookie);

        // Refresh Token 쿠키 설정
        Cookie refreshTokenCookie = new Cookie("refresh_token", tokenInfo.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/api/v1/auth/refresh"); // 리프레시 토큰은 특정 경로에서만 접근 가능
        refreshTokenCookie.setSecure(false);
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        // 리프레시 토큰 만료 시간 설정 (초 단위)
        refreshTokenCookie.setMaxAge(2592000); // 30일
        response.addCookie(refreshTokenCookie);
    }
}