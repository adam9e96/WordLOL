package com.adam9e96.wordlol.controller.impl.view;

import com.adam9e96.wordlol.controller.interfaces.view.LoginViewController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginViewControllerImpl implements LoginViewController {
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
    public String home() {
        return "redirect:/word/list";
    }

}
