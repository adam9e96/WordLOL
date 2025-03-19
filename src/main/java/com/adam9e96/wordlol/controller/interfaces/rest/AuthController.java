package com.adam9e96.wordlol.controller.interfaces.rest;

import com.adam9e96.wordlol.dto.request.TokenRefreshRequest;
import com.adam9e96.wordlol.dto.response.TokenResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public interface AuthController {

    @GetMapping("/login/oauth2/success")
    ResponseEntity<com.adam9e96.wordlol.dto.response.TokenResponse> oAuth2LoginSuccess(Authentication authentication);

    @PostMapping("/refresh")
    ResponseEntity<TokenResponse> refreshToken(@RequestBody TokenRefreshRequest request);

    @GetMapping("/me")
    ResponseEntity<String> getCurrentUser(HttpServletRequest request);

}
