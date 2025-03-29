package com.adam9e96.wordlol.config.security.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtProperties {
    private String secretKey;
    private long accessTokenValidityInMs; // 1시간
    private long refreshTokenValidityInMs; // 30일

}
