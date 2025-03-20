package com.adam9e96.wordlol.controller.impl.view;

import com.adam9e96.wordlol.config.security.jwt.JwtTokenProvider;
import com.adam9e96.wordlol.controller.interfaces.view.LoginViewController;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@RequiredArgsConstructor
@Controller
public class LoginViewControllerImpl implements LoginViewController {
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @GetMapping("/login")
    public String login() {
        return "login"; // src/main/resources/templates/login.html을 찾음
    }

    // OAuth 로그인으로 리다이렉트하는 경로 추가
    @GetMapping("/auth/google")
    public String googleLogin() {
        return "redirect:/oauth2/authorization/google";
    }

    // 루트 페이지로 리다이렉트
    @Override
    @GetMapping("/")
    public String home(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            return "redirect:/word/dashboard";  // 로그인한 경우 대시보드로
        } else {
            return "views/common/index";  // 로그인하지 않은 경우 랜딩 페이지로
        }
    }


}
