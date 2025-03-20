package com.adam9e96.wordlol.controller.interfaces.view;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public interface LoginViewController {

    @GetMapping("/login")
    String login();

    @GetMapping("/")
    String home(HttpServletRequest request);
}
