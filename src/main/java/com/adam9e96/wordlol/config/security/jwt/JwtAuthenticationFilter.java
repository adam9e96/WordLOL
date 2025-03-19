package com.adam9e96.wordlol.config.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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

        // HTTP 요청 헤더에서 토큰 추출
        String token = jwtTokenProvider.resolveToken(request);
        log.info("추출된 토큰: {}", token != null ? "토큰 있음" : "토큰 없음");

        // 토큰이 유효한 경우 인증 정보 설정
        if (token != null && jwtTokenProvider.validateToken(token)) {
            try {
                Authentication authentication = jwtTokenProvider.getAuthentication(token);
                // SecurityContext 에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("Security Context 에 '{}' 인증 정보를 저장했습니다.", authentication.getName());
            } catch (Exception e) {
                log.error("인증 처리 중 오류 발생: {}", e.getMessage());
            }
        } else if (token != null) {
            log.warn("유효하지 않은 토큰: {}", token);
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }
}
