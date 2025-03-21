package com.adam9e96.wordlol.config.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT 토큰 기반 인증을 처리하는 필터
 * HTTP 요청이 들어올 때마다 JWT 토큰을 검사하고, 유효한 경우 인증 정보를 SecurityContext에 저장
 * 모든 API 요청에 대해 토큰 유효성을 검사하고 인증 정보를 설정합니다.
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 토큰 추출
        // 쿠키에서 액세스 토큰 추출
        String token = extractTokenFromCookie(request);

        // 쿠키에 토큰이 없으면 헤더에서 추출 시도 (기존 로직 유지)
        if (token == null) {
            token = jwtTokenProvider.resolveToken(request);
        }

        log.info("추출된 토큰: {}", token != null ? "토큰 있음" : "토큰 없음");

        // 2. 토큰 검증
        // 토큰이 유효한 경우 인증 정보 설정
        // 올바른 서명인지, 만료 여부, 적절한 토큰 구조인지 확인
        if (jwtTokenProvider.validateToken(token)) {
            try {
                // 유효한 토큰이라면 토큰에서 인증 정보 추출
                Authentication authentication = jwtTokenProvider.getAuthentication(token);
                // SecurityContext 에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("Security Context 에 '{}' 인증 정보를 저장했습니다.", authentication.getName());
            } catch (Exception e) {
                log.error("인증 처리 중 오류 발생: {}", e.getMessage());
            }
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

    // 쿠키에서 액세스 토큰 추출
    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            // 쿠키에서 access_token을 찾음
            for (Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    log.info("쿠키에서 토큰 추출: 토큰 있음");
                    return cookie.getValue();
                }
            }
        }

        return null;
    }

}
