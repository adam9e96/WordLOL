package com.adam9e96.wordlol.config.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 인증되지 않은 사용자가 보안이 필요한 리소스에 접근할 때 처리하는 클래스
 * 인증되지 않은 사용자가 요청을 보낼 때 401 Unauthorized 응답을 반환합니다.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        // 접근 불가 페이지로 리다이렉트
        response.sendRedirect("/access-denied"); // access-denied 페이지로 리다이렉트

        // 또는 특정 상태 코드와 함께 리다이렉트
        // response.setStatus(HttpServletResponse.SC_FOUND); // 302 상태 코드
        // response.setHeader("Location", "/access-denied");
        // response.flushBuffer();
    }
}
