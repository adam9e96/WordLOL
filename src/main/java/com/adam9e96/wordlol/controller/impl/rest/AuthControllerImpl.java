package com.adam9e96.wordlol.controller.impl.rest;

import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.controller.interfaces.rest.AuthController;
import com.adam9e96.wordlol.dto.common.TokenInfo;
import com.adam9e96.wordlol.dto.request.TokenRefreshRequest;
import com.adam9e96.wordlol.dto.response.TokenResponse;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import com.adam9e96.wordlol.service.interfaces.JwtAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.adam9e96.wordlol.entity.User;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;


@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthControllerImpl implements AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtAuthService jwtAuthService;
    private final UserRepository userRepository;


    /**
     * OAuth2 로그인 성공 후 JWT 토큰 발급
     *
     * @return JWT 토큰 정보
     */
    @GetMapping("/login/oauth2/success")
    @Override
    public ResponseEntity<TokenResponse> oAuth2LoginSuccess(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest().build();
        }

        // 사용자 정보로 토큰 생성
        TokenInfo tokenInfo = jwtAuthService.createTokenForOAuthUser(authentication.getName());

        // 토큰 응답 생성

        TokenResponse response = new TokenResponse(tokenInfo.getGrantType(), tokenInfo.getAccessToken(), tokenInfo.getRefreshToken());

        return ResponseEntity.ok(response);
    }

    /**
     * 리프레시 토큰을 이용해 새로운 액세스 토큰 발급
     *
     * @param request 리프레시 토큰 요청
     * @return 새로운 JWT 토큰 정보
     */
    @PostMapping("/refresh")
    @Override
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request) {
        // 쿠키에서 리프레시 토큰 추출
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            TokenInfo tokenInfo = jwtAuthService.refreshToken(refreshToken);

            // 새로운 토큰을 쿠키로 설정
            Cookie accessTokenCookie = new Cookie("access_token", tokenInfo.getAccessToken());
            accessTokenCookie.setHttpOnly(true);
            accessTokenCookie.setPath("/");
            accessTokenCookie.setSecure(false); // 개발 환경에서는 false, 운영 환경에서는 true로 변경
            accessTokenCookie.setAttribute("SameSite", "Lax");
            accessTokenCookie.setMaxAge(3600); // 1시간

            // 응답에 쿠키 추가
            HttpServletResponse response = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getResponse();
            response.addCookie(accessTokenCookie);

            // 토큰 응답 생성 (클라이언트에게는 토큰 정보를 응답 바디로만 보냄)
            TokenResponse responseBody = new TokenResponse(
                    tokenInfo.getGrantType(),
                    "**토큰이 쿠키로 전송되었습니다**",
                    "**토큰이 쿠키로 전송되었습니다**"
            );

            return ResponseEntity.ok(responseBody);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    /**
     * 현재 인증된 사용자 정보 조회
     *
     * @param request HTTP 요청
     * @return 인증된 사용자 이메일
     */
    @GetMapping("/me")
    @Override
    public ResponseEntity<String> getCurrentUser(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.getEmailFromToken(token);
            return ResponseEntity.ok(email);
        }

        return ResponseEntity.badRequest().build();
    }

    /**
     * 현재 인증 상태와 사용자 정보를 반환합니다.
     *
     * @param session HTTP 세션
     * @return 인증 상태와 사용자 정보
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        // 세션에서 인증 상태 확인
        Boolean authenticated = (Boolean) session.getAttribute("authenticated");
        response.put("authenticated", authenticated != null && authenticated);

        // 인증된 경우 사용자 정보 추가
        if (authenticated != null && authenticated) {
            String email = (String) session.getAttribute("userEmail");

            if (email != null) {
                // 사용자 정보 조회 (간단한 예시)
                User user = userRepository.findByEmail(email).orElse(null);

                if (user != null) {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("email", user.getEmail());
                    userInfo.put("name", user.getName());
                    userInfo.put("picture", user.getPicture());

                    response.put("userInfo", userInfo);
                }
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * 로그아웃 처리
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        // 액세스 토큰 쿠키 삭제
        Cookie accessTokenCookie = new Cookie("access_token", "");
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0);
        response.addCookie(accessTokenCookie);

        // 리프레시 토큰 쿠키 삭제
        Cookie refreshTokenCookie = new Cookie("refresh_token", "");
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/api/v1/auth/refresh");
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(refreshTokenCookie);

        // 보안 컨텍스트 클리어
        SecurityContextHolder.clearContext();

        Map<String, String> responseData = new HashMap<>();
        responseData.put("message", "로그아웃 되었습니다.");

        return ResponseEntity.ok(responseData);
    }


}
