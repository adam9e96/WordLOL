package com.adam9e96.wordlol.config.security.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Base64;

@Component
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtProperties {
    // 더 강력한 키 (최소 256비트 = 32바이트)
    private String secretKey = Base64.getEncoder().encodeToString(
            "ThisIsASecureSecretKeyForJwtAuthenticationRequiredMinimum32BytesFor256Bits".getBytes());
    private long accessTokenValidityInMs = 3600000; // 1시간
    private long refreshTokenValidityInMs = 2592000000L; // 30일
}
