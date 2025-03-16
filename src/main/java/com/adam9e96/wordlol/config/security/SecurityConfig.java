package com.adam9e96.wordlol.config.security;

import com.adam9e96.wordlol.service.interfaces.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.config.annotation.web.configurers.LogoutConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 설정 클래스
 * 인증, 인가, 로그인, 로그아웃 등 보안 관련 설정을 담당
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 보안 필터 체인 설정
     * 모든 HTTP 요청에 대한 보안 규칙을 정의함
     *
     * @param http HttpSecurity 객체
     * @return 구성된 SecurityFilterChain
     * @throws Exception 보안 설정 중 발생할 수 있는 예외
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CustomOAuth2UserService customOAuth2UserService) throws Exception {
        http
                // CSRF 보호 비활성화 (REST API 또는 개발 환경에서 사용)
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(this::customAuthorizeRequests)
                .oauth2Login(oauth2 -> oauth2.userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService)).defaultSuccessUrl("/word/dashboard")
                        .failureUrl("/login?error=true"))
//                .formLogin(this::formLogin)
                .logout(this::logout
                );

        // H2 데이터베이스 콘솔 사용을 위한 프레임 옵션 비활성화
        // H2 콘솔은 iframe을 사용하므로 X-Frame-Options을 비활성화해야 함
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        return http.build();
    }

    /**
     * HTTP 요청 인가 규칙을 커스터마이징하는 메서드
     * HTTP 요청 인가 규칙 설정
     *
     * @param auth AuthorizeHttpRequestsConfigurer 객체
     */
    private void customAuthorizeRequests(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        // 공개 접근 가능한 리소스 설정 (로그인 없이 접근 가능함)
        auth.requestMatchers("/", "/login", "/js/**", "/css/**", "/images/**", "/h2-console/**").permitAll()
                .anyRequest().authenticated(); // 그 외 모든 요청은 인증 필요
    }

    // 폼 로그인 설정
    private void formLogin(FormLoginConfigurer<HttpSecurity> auth) {
        auth.loginPage("/login") // 커스텀 로그인 페이지 URL
                .defaultSuccessUrl("/word/dashboard") // 로그인 성공 시 리다이렉트할 URL
                .permitAll(); // 로그인 페이지는 모든 사용자에게 접근 허용
    }

    // 로그아웃 설정
    private void logout(LogoutConfigurer<HttpSecurity> auth) {
        auth.logoutSuccessUrl("/")
                .permitAll(); // 로그아웃 페이지는 모든 사용자에게 접근 허용
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

    /**
     * 사용자 상세 서비스 빈 설정
     * 인증에 필요한 사용자 정보를 제공
     * <p>
     * 참고: 이 구현은 개발 환경을 위한 임시 설정임
     * 실제 운영 환경에서는 데이터베이스에서 사용자 정보를 가져오는 구현으로 대체해야 함
     *
     * @param encoder 비밀번호 인코더
     * @return 메모리 내 사용자 관리자
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        // 일반 사용자 계정 생성
        UserDetails user = User.builder()
                .username("user") // 사용자 아이디
                .password(encoder.encode("password")) // 비밀번호 해시화
                .roles("USER") // 사용자 역할(권한)
                .build();

        // 관리자 계정 생성
        UserDetails admin = User.builder()
                .username("admin") // 관리자 아이디
                .password(encoder.encode("admin")) // 비밀번호 해시화
                .roles("ADMIN") // 관리자 역할(권한)
                .build();

        // 메모리 내 사용자 관리자에 사용자 추가
        return new InMemoryUserDetailsManager(user, admin);
    }
}