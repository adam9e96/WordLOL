package com.adam9e96.wordlol.controller.interfaces;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public interface LoginController {

    @GetMapping("/login")
    String login();

    @GetMapping("/")
    String home();
}
