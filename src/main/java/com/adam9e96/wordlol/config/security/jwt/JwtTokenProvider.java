package com.adam9e96.wordlol.config.security.jwt;

import com.adam9e96.wordlol.dto.common.TokenInfo;
import com.adam9e96.wordlol.enums.Role;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

/**
 * JWT를 생성하고, 검증하고 인증 정보를 추출하는 작업을 처리하는 클래스
 */
@Slf4j
@Component
public class JwtTokenProvider {
    private final Key key;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;

    public JwtTokenProvider(JwtProperties jwtProperties, UserRepository userRepository) {
        this.jwtProperties = jwtProperties;
        this.userRepository = userRepository;
        this.key = initializeKey(jwtProperties.getSecretKey());
    }

    private Key initializeKey(String secretKey) {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            log.error("JWT Key 초기화 실패 : {}", e.getMessage());
            throw e;
        }
    }

    // 사용자 인증 정보를 바탕으로 액세스 토큰과 리프레시 토큰을 생성합니다
    // 추후 id, password 기반 로그인 시 사용할 메서드
    public TokenInfo createToken(Authentication authentication) {
        // 권한 가져오기
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        log.info("사용자 권한={}", authorities);

        // 토큰 만료 시간 설정
        long now = (new Date()).getTime(); // 현재 시간을 가져옴
        Date accessTokenValidity = new Date(now + jwtProperties.getAccessTokenValidityInMs()); // 1시간 후
        Date refreshTokenValidity = new Date(now + jwtProperties.getRefreshTokenValidityInMs()); // 30일 후

        // 액세스 토큰 생성
        // JWT 라이브러리(Jwts.builder())를 사용하여 subject(사용자 이름), auth(권한 정보), expiration(만료 시간) 등을
        // 포함한 JWT 액세스 토큰을 생성합니다
        // 헤더 정보(typ, alg)는 signWith() 메서드에서 자동으로 설정됩니다
        // signWith(): 서명 생성을 담당 하는 메서드로, 비밀키와 알고리즘을 지정 하고 헤더 정보를 자동으로 설정합니다
        // ex : typ: JWT, alg: HS256
        // 핵심
        // 1. 헤더 : 알고리즘과 토큰 타입 정보 (자동 생성)
        // 2. 페이로드 : 사용자 정보와 권한 정보 (subject, auth, expiration)
        // 3. 서명 : 비밀키와 알고리즘을 사용하여 생성된 서명 (signWith() 메서드에서 자동 생성)
        // 마지막으로 compact() 메서드를 호출하여 최종 JWT 문자열을 생성합니다
        String accessToken = Jwts.builder()
                .subject(authentication.getName())
                .claim("auth", authorities)
                .expiration(accessTokenValidity)
                .signWith(key)  // 최신 API는 기본적으로 HS256 알고리즘 사용
                .compact();

        // Refresh Token 생성
        String refreshToken = Jwts.builder()
                .subject(authentication.getName())
                .expiration(refreshTokenValidity)
                .signWith(key)
                .compact();

       /*
        * 이 코드는 JWT 토큰 인증 시스템에서 생성된 토큰 정보를 담은 `TokenInfo` 객체를 생성하여 반환하는 부분입니다:
        1. `TokenInfo.builder()`는 빌더 패턴을 사용해 `TokenInfo` 객체 생성을 시작합니다
        2. `.grantType("Bearer")`는 토큰 타입을 "Bearer"로 설정합니다. Bearer는 JWT와 같은 토큰 기반 인증에서 사용되는 표준 인증 방식입니다
        3. `.accessToken(accessToken)`은 앞서 생성된 액세스 토큰을 설정합니다. 이 토큰은 사용자 인증에 사용됩니다
        4. `.refreshToken(refreshToken)`은 앞서 생성된 리프레시 토큰을 설정합니다. 이 토큰은 액세스 토큰이 만료됐을 때 새로운 액세스 토큰을 발급받기 위해 사용됩니다
        5. `.build()`는 설정된 값들로 최종 `TokenInfo` 객체를 생성합니다
        이렇게 생성된 `TokenInfo` 객체는 클라이언트에게 전달되어 이후 API 요청 시 인증 정보로 사용됩니다.
        *
        * 예시 JSON 응답
       {
           "grantType": "Bearer",
           "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTcxNTYxMjM0NX0.xxx...",
           "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZXhwIjoxNzE4MjAwMzQ1fQ.yyy..."
       }
        */
        return TokenInfo.builder()
                .grantType("Bearer")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    // JWT 토큰에서 인증 정보 조회
    // OAuth 로그인을 통해 이메일과 역할을 이용해 토큰을 생성하는 메서드
    public Authentication getAuthentication(String token) {
        // 토큰 복호화
        Claims claims = parseClaims(token);

        if (claims.get("auth") == null) {
            throw new JwtException("권한 정보가 없는 토큰입니다.");
        }

        // 클레임에서 권한 정보 가져오기
        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get("auth").toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .toList();

        // UserDetails 객체를 만들어서 Authentication 리턴
        UserDetails principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }

    // 토큰 유효성 검증
    // JWT 토큰이 제대로 서명되었는지, 만료되었는지 등을 확인하여 유효성ㅇ르 검증합니다
    // 이 메서드의 목적은 토큰의 유효성만 검사하는 것. 토큰이 올바르게 서명되었는지, 만료되지 않았는지만 확인한다.
    // 검증되는 것들
    // 1. 서명 검증 (잘못된 서명이면 예외 발생)
    // 2. 토큰 구조 검증 (형식이 잘못되었으면 예외 발생)
    // 3. 만료 시간 검증 (만료되었으면 예외 발생)
    // getPayload()를 사용 안하는 이유
    // validateToken() 메서드에서는 토큰의 내용이 아니라 유효성(서명, 만료) 만 검증하면 되기 때문에
    // .getPayload()를 호출 하지 않음
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith((SecretKey) key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("잘못된 JWT 서명입니다: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("만료된 JWT 토큰입니다: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("지원되지 않는 JWT 토큰입니다: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT 토큰이 잘못되었습니다: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT 토큰 검증 중 알 수 없는 오류 발생: {}", e.getMessage());
        }
        return false;
    }


    // Request Header 에서 토큰 정보 추출
    // HTTP 요청의 Authorization 헤더에서 토큰을 추출합니다
    // Authorization: Bearer {token} 형식으로 전달된 토큰을 추출합니다
    public String resolveToken(HttpServletRequest request) {
        // 1. 헤더에서 토큰 추출 시도
        String bearerToken = request.getHeader("Authorization");
        log.info("Authorization 헤더: {}", bearerToken);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // 2. 쿠키에서 토큰 추출 시도
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    log.info("쿠키에서 토큰 추출: 토큰 있음");
                    return cookie.getValue();
                }
            }
        }

        return null;
    }

    // 클레임 추출 : JWT 토큰을 디코딩하여 그 안에 포함된 클레임(사용자 역할, 만료 시간 등)을 추출합니다
    // 예시
    // {
    //  "sub": "user@example.com",     // 토큰 제목(subject) - 보통 사용자 이메일이나 ID
    //  "auth": "ROLE_USER",           // 사용자 권한 정보
    //  "exp": 1715612345,             // 만료 시간(expiration time)
    //  "iat": 1715608745              // 발급 시간(issued at)
    // }
    private Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith((SecretKey) key) // 서명 검증에 사용할 키 설정
                    .build()// 파서 구성 완료
                    .parseSignedClaims(token) // 서명된 토큰 파싱
                    .getPayload(); // 페이로드(클레임) 추출
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    // 이메일로 새 토큰 생성 (OAuth 로그인 후 사용)
    // 이메일과 역할(ROLE)을 기반으로 JWT 토큰을 생성하는 메서드
    // 이 메서드는 OAuth 로그인을 통해 사용자의 이메일과 역할을 기반으로 JWT 토큰을 생성합니다
    // 주요 기능:
    //OAuth 로그인 후 사용자 이메일과 역할 정보를 받아 JWT 토큰을 생성합니다.
    //액세스 토큰과 리프레시 토큰 두 가지를 생성합니다:
    //액세스 토큰: 사용자 인증에 사용 (만료 기간: 1시간)
    //리프레시 토큰: 액세스 토큰 갱신에 사용 (만료 기간: 30일)
    //두 토큰을 포함한 TokenInfo 객체를 반환합니다.
    public TokenInfo createTokenFromEmail(String email, Role role) {
        long now = (new Date()).getTime();
        Date accessTokenValidity = new Date(now + jwtProperties.getAccessTokenValidityInMs());
        Date refreshTokenValidity = new Date(now + jwtProperties.getRefreshTokenValidityInMs());

        // 액세스 토큰 생성
        String accessToken = Jwts.builder()
                .subject(email)
                .claim("auth", role.getKey())
                .expiration(accessTokenValidity)
                .signWith(key)
                .compact();

        // 리프레시 토큰 생성
        String refreshToken = Jwts.builder()
                .subject(email)
                .expiration(refreshTokenValidity)
                .signWith(key)
                .compact();

        // TokenInfo 객체에 액세스 토큰과 리프레시 토큰, 타입을 설정하여 반환
        return TokenInfo.builder()
                .grantType("Bearer")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    // 토큰에서 이메일 추출
    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public TokenInfo refreshToken(String refreshToken) {
        // 리프레시 토큰 유효성 검사
        if (!validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        // 토큰에서 이메일 추출
        String email = getEmailFromToken(refreshToken);

        // 사용자 정보 조회
        com.adam9e96.wordlol.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다: " + email));

        // 새로운 액세스 토큰 생성( 리프레시 토큰도 갱신됨)
        return createTokenFromEmail(email, user.getRole());
    }
}