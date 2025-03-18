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
    private String secretKey = "default_jwt_secret_key_must_be_changed_in_production_environment_with_minimum_512_bits";
    private long accessTokenValidityInMs = 3600000; // 1시간
    private long refreshTokenValidityInMs = 2592000000L; // 30일


}
