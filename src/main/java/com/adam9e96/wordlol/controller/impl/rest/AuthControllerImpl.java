package com.adam9e96.wordlol.controller.impl.rest;

import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.dto.common.TokenInfo;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;


@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthControllerImpl {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @GetMapping("/login/oauth2/success")
    public ResponseEntity<Map<String, Object>> oauthLoginSuccess() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("인증 정보가 없습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "인증 실패"));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. email: " + email));

        // JWT 토큰 생성
        TokenInfo tokenInfo = jwtTokenProvider.createTokenFromEmail(email, user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", tokenInfo.getAccessToken());
        response.put("refreshToken", tokenInfo.getRefreshToken());
        response.put("user", Map.of(
                "email", user.getEmail(),
                "name", user.getName(),
                "picture", user.getPicture()
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(String refreshToken) {
        // 리프레시 토큰 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "유효하지 않은 토큰"));
        }

        // 리프레시 토큰에서 사용자 이메일 추출
        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 새로운 액세스 토큰 발급
        TokenInfo newTokenInfo = jwtTokenProvider.createTokenFromEmail(email, user.getRole());

        return ResponseEntity.ok(Map.of(
                "accessToken", newTokenInfo.getAccessToken(),
                "refreshToken", newTokenInfo.getRefreshToken()
        ));
    }
}
