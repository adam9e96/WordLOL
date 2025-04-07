package com.adam9e96.wordlol.controller.interfaces.rest;

import com.adam9e96.wordlol.dto.response.TokenResponse;
import com.adam9e96.wordlol.dto.response.UserInfoResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.Map;

public interface AuthController {

    @PostMapping("/refresh")
    ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request);

    @GetMapping("/me")
    ResponseEntity<UserInfoResponse> getCurrentUser(HttpServletRequest request);

    @GetMapping("/status")
    ResponseEntity<Map<String, Object>> getAuthStatus(HttpServletRequest request);

    @PostMapping("/logout")
    ResponseEntity<Map<String, String>> logout(HttpServletResponse response);

}
