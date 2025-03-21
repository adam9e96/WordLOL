package com.adam9e96.wordlol.controller.impl.rest;

import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.controller.interfaces.rest.AuthController;
import com.adam9e96.wordlol.dto.common.TokenInfo;
import com.adam9e96.wordlol.dto.request.TokenRefreshRequest;
import com.adam9e96.wordlol.dto.response.TokenResponse;
import com.adam9e96.wordlol.service.interfaces.JwtAuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthControllerImpl implements AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtAuthService jwtAuthService;


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
    public ResponseEntity<TokenResponse> refreshToken(@RequestBody TokenRefreshRequest request) {
        try {
            TokenInfo tokenInfo = jwtAuthService.refreshToken(request.refreshToken());

            // 토큰 응답 생성 (인증 타입, 액세스 토큰, 리프레시 토큰 포함)
            TokenResponse response = new TokenResponse(tokenInfo.getGrantType(), tokenInfo.getAccessToken(), tokenInfo.getRefreshToken());

            return ResponseEntity.ok(response); // 200 OK 와 함께 새 토큰 정보 반환
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

}
