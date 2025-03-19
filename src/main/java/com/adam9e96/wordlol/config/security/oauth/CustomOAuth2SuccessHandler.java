package com.adam9e96.wordlol.config.security.oauth;

import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.dto.common.TokenInfo;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * OAuth2 로그인 성공 시 JWT 토큰을 발급하고 프론트엔드로 리다이렉션하는 핸들러
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    // 로그인 성공 후 리다이렉션할 기본 URL
    private static final String DEFAULT_SUCCESS_URL = "/word/dashboard";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null) {
            log.error("OAuth 로그인 성공했지만 이메일 정보를 찾을 수 없습니다.");

            // 오류 페이지 또는 로그인 페이지로 리다이렉션
            response.sendRedirect("/login?error=no_email");
            return;
        }

        try {
            log.info("OAuth 로그인 성공: {}", email);

            // 사용자 조회
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다: " + email));

            // JWT 토큰 생성
            TokenInfo tokenInfo = jwtTokenProvider.createTokenFromEmail(email, user.getRole());

            // 리다이렉션 URL 구성 (쿼리 파라미터로 토큰 정보 포함)
            String targetUrl = UriComponentsBuilder.fromUriString(DEFAULT_SUCCESS_URL)
                    .queryParam("accessToken", tokenInfo.getAccessToken())
                    .queryParam("refreshToken", tokenInfo.getRefreshToken())
                    .queryParam("tokenType", tokenInfo.getGrantType())
                    .build().toUriString();

            log.info("리다이렉션 URL: {}", targetUrl);

            // 구성된 URL로 리다이렉션
            response.sendRedirect(targetUrl);

        } catch (Exception e) {
            log.error("OAuth2 인증 성공 후 처리 중 오류 발생", e);

            // 오류 메시지와 함께 로그인 페이지로 리다이렉션
            response.sendRedirect("/login?error=login_failed&message=" + e.getMessage());
        }
    }

    /**
     * 오류 응답을 JSON 형태로 전송 (필요 시 사용)
     */
    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, String> error = new HashMap<>();
        error.put("error", message);

        response.getWriter().write(objectMapper.writeValueAsString(error));
    }

    /**
     * 토큰 정보를 JSON 형태로 전송 (필요 시 사용)
     */
    private void sendTokenResponse(HttpServletResponse response, TokenInfo tokenInfo) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, String> tokens = new HashMap<>();
        tokens.put("tokenType", tokenInfo.getGrantType());
        tokens.put("accessToken", tokenInfo.getAccessToken());
        tokens.put("refreshToken", tokenInfo.getRefreshToken());

        response.getWriter().write(objectMapper.writeValueAsString(tokens));
    }
}