package com.adam9e96.wordlol.config.security;

import com.adam9e96.wordlol.config.security.jwt.JwtAuthenticationEntryPoint;
import com.adam9e96.wordlol.config.security.jwt.JwtAuthenticationFilter;
import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.config.security.oauth.CustomOAuth2SuccessHandler;
import com.adam9e96.wordlol.service.impl.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.config.annotation.web.configurers.LogoutConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 설정 클래스
 * JWT 토큰 기반 인증과 HttpOnly 쿠키를 활용한 보안 설정
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    /**
     * 보안 필터 체인 설정
     * 모든 HTTP 요청에 대한 보안 규칙을 정의함
     *
     * @param http HttpSecurity 객체
     * @return 구성된 SecurityFilterChain
     * @throws Exception 보안 설정 중 발생할 수 있는 예외
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 보호 활성화 (JWT + 쿠키 기반 인증이므로 CSRF 보호 필요)
                .csrf(csrf -> csrf
                        // API 요청에 대해서는 CSRF 보호 비활성화
                        .ignoringRequestMatchers("/api/**", "/oauth2/**", "/auth/**"))
                // CORS 설정 추가
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 세션 관리 정책 설정 (JWT 사용하므로 세션은 STATELESS로 설정)
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 인증 실패 핸들러 설정
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                // 요청 인가 규칙 설정
                .authorizeHttpRequests(this::customAuthorizeRequests)
                // OAuth2 로그인 설정
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(customOAuth2SuccessHandler)
                        .failureUrl("/login?error=true"))
                // 로그아웃 설정
                .logout(this::logout)
                // JWT 필터 추가
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
        http.headers(headers ->
                headers.frameOptions(frameOptions -> frameOptions.sameOrigin()) // H2 콘솔 접근 허용
        );
        return http.build();
    }

    /**
     * HTTP 요청 인가 규칙을 커스터마이징하는 메서드
     *
     * @param auth AuthorizeHttpRequestsConfigurer 객체
     */
    private void customAuthorizeRequests(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth
                // 공개 접근 가능한 정적 리소스 및 인증 관련 경로
                .requestMatchers(
                        "/",
                        "/logout",
                        "/oauth2/**",
                        "/auth/**",
                        "/js/**",
                        "/css/**",
                        "/images/**",
                        "/favicon.ico",
                        "/h2-console/**",
                        "/api/v1/auth/**",
                        "/word/daily",
                        "/word/list",
                        "/access-denied"
                ).permitAll()
                // API 요청에 대한 세밀한 권한 설정
                .requestMatchers(HttpMethod.GET, "/api/v1/words/public/**").permitAll()
                // 뷰 페이지 경로들은 모두 인증 필요
                .requestMatchers(
                        "/word/**",
                        "/wordbook/**",
                        "/dashboard"
                ).authenticated()
                // 그 외 모든 요청은 인증 필요
                .anyRequest().authenticated();
    }

    /**
     * 로그아웃 설정
     * JWT 토큰이 담긴 쿠키를 삭제하도록 구성
     */
    private void logout(LogoutConfigurer<HttpSecurity> logout) {
        logout
                .logoutUrl("/api/v1/auth/logout")
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("access_token", "refresh_token")
                .permitAll();
    }

    /**
     * CORS 설정
     * 쿠키 기반 인증을 위한 CORS 설정 추가
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*")); // 개발 환경 설정
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // 쿠키 허용을 위해 필요
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setMaxAge(3600L); // 1시간 캐싱

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * 비밀번호 인코더 빈 설정
     * 사용자 비밀번호를 안전하게 해시화하는 데 사용
     *
     * @return BCrypt 비밀번호 인코더
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // BCrypt 해싱 알고리즘 사용
    }
}