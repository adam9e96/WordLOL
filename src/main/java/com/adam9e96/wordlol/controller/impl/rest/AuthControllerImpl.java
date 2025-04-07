package com.adam9e96.wordlol.controller.impl.rest;

import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.controller.interfaces.rest.AuthController;
import com.adam9e96.wordlol.dto.common.TokenInfo;
import com.adam9e96.wordlol.dto.response.TokenResponse;
import com.adam9e96.wordlol.dto.response.UserInfoResponse;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 인증 토큰 갱신, 현재 사용자 정보 조회, 인증 상태 확인, 로그아웃 등의 기능을 처리
 * 로그인 기능은 OAuth2SuccessHandler 에서 처리
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthControllerImpl implements AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    // 로그인 성공 후 jwt 발급은 성공핸들러에서 처리

    /**
     * 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다
     *
     * @param request 리프레시 토큰이 포함된 HTTP 요청
     * @return 새로운 JWT 토큰 정보
     */
    @PostMapping("/refresh")
    @Override
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request) {
        // 쿠키에서 리프레시 토큰 추출
        String refreshToken = extractRefreshTokenFromCookies(request);

        if (refreshToken == null) {
            log.warn("리프레시 토큰을 찾을 수 없습니다.");
            return ResponseEntity.badRequest().build();
        }

        try {
            // 토큰 갱신
            TokenInfo tokenInfo = jwtTokenProvider.refreshToken(refreshToken);

            HttpServletResponse response = (HttpServletResponse) request.getAttribute("response");
            setTokenCookies(response, tokenInfo);

            log.info("토큰 갱신 성공: {}", tokenInfo.getAccessToken());

            // 토큰 응답 생성 (실제 토큰 값은 마스킹하여 보안 강화)
            TokenResponse responseBody = new TokenResponse(
                    tokenInfo.getGrantType(),
                    "**토큰이 쿠키로 전송되었습니다**",
                    "**토큰이 쿠키로 전송되었습니다**"
            );

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            log.error("토큰 갱신 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }


    /**
     * 현재 인증된 사용자의 정보를 조회합니다.
     *
     * @param request JWT 토큰이 포함된 HTTP 요청
     * @return 사용자 정보를 포함한 응답 엔티티
     */
    @GetMapping("/me")
    @Override
    public ResponseEntity<UserInfoResponse> getCurrentUser(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);

        if (token == null || !jwtTokenProvider.validateToken(token)) {
            log.warn("유효한 토큰이 없어 사용자 정보 조회 실패");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String email = jwtTokenProvider.getEmailFromToken(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.warn("토큰의 이메일({})에 해당하는 사용자가 없습니다.", email);
                        return new RuntimeException("사용자를 찾을 수 없습니다");
                    });

            UserInfoResponse userInfo = new UserInfoResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getName(),
                    user.getPicture(),
                    user.getRole().getKey()
            );

            log.info("사용자 정보 조회 성공: {}", email);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            log.error("사용자 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 현재 사용자의 인증 상태와 정보를 조회합니다.
     * JWT 토큰이 있으면 토큰에서 사용자 정보를 추출하여 반환합니다.
     *
     * @param request HTTP 요청 (JWT 토큰 확인용)
     * @return 인증 상태와 사용자 정보를 포함한 응답 엔티티
     */
    @GetMapping("/status")
    @Override
    public ResponseEntity<Map<String, Object>> getAuthStatus(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        String token = jwtTokenProvider.resolveToken(request);

        boolean isAuthenticated = token != null && jwtTokenProvider.validateToken(token);
        response.put("authenticated", isAuthenticated);

        if (isAuthenticated) {
            try {
                String email = jwtTokenProvider.getEmailFromToken(token);
                userRepository.findByEmail(email)
                        .ifPresent(user -> {
                            Map<String, Object> userInfo = new HashMap<>();
                            userInfo.put("id", user.getId());
                            userInfo.put("email", user.getEmail());
                            userInfo.put("name", user.getName());
                            userInfo.put("picture", user.getPicture());
                            userInfo.put("role", user.getRole().getKey());
                            response.put("userInfo", userInfo);
                        });
            } catch (Exception e) {
                log.error("사용자 정보 조회 중 오류 발생: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * 로그아웃 처리
     */
    @PostMapping("/logout")
    @Override
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {

        // 액세스 토큰 쿠키 삭제
        clearCookie(response, "access_token", "/");

        // 리프레시 토큰 쿠키 삭제
        clearCookie(response, "refresh_token", "/api/v1/auth/refresh");

        // 보안 컨텍스트 클리어
        SecurityContextHolder.clearContext();

        log.info("사용자 로그아웃 성공");

        Map<String, String> responseData = new HashMap<>();
        responseData.put("message", "로그아웃 되었습니다.");
        responseData.put("status", "success");

        return ResponseEntity.ok(responseData);
    }

    /**
     * 지정된 쿠키를 삭제합니다.
     *
     * @param response HTTP 응답
     * @param name     쿠키 이름
     * @param path     쿠키 경로
     */
    private void clearCookie(HttpServletResponse response, String name, String path) {
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setPath(path);
        cookie.setMaxAge(0);
        cookie.setSecure(false); // 개발 환경에서는 false, 운영 환경에서는 true로 변경
        response.addCookie(cookie);
    }

    /**
     * HTTP 요청 쿠키에서 리프레시 토큰을 추출합니다.
     *
     * @param request HTTP 요청
     * @return 리프레시 토큰 문자열 또는 null
     */
    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    /**
     * 인증 토큰을 HTTP 쿠키로 설정합니다.
     *
     * @param response  HTTP 응답
     * @param tokenInfo 토큰 정보
     */
    private void setTokenCookies(HttpServletResponse response, TokenInfo tokenInfo) {
        // 액세스 토큰 쿠키 설정
        Cookie accessTokenCookie = new Cookie("access_token", tokenInfo.getAccessToken());
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setSecure(false); // 개발 환경에서는 false, 운영 환경에서는 true로 변경
        accessTokenCookie.setAttribute("SameSite", "Lax");
        accessTokenCookie.setMaxAge(3600); // 1시간
        response.addCookie(accessTokenCookie);

        // 리프레시 토큰 쿠키 설정 (필요한 경우)
        Cookie refreshTokenCookie = new Cookie("refresh_token", tokenInfo.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/api/v1/auth/refresh");
        refreshTokenCookie.setSecure(false);
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        refreshTokenCookie.setMaxAge(2592000); // 30일
        response.addCookie(refreshTokenCookie);
    }


}
