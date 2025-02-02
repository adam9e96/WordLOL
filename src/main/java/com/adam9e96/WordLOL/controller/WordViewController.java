package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.service.EnglishWordService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/word")
@AllArgsConstructor
public class WordViewController {

    private final EnglishWordService englishWordService;

    @RequestMapping("/study")
    public String showStudy() {
        return "study";
    }

    @GetMapping("/register")
    public String showRegister() {
        return "register";
    }

    @GetMapping("/list")
    public String showList() {
        return "word-list";
    }

    @GetMapping("/dashboard")
    public String showMain() {
        return "dashboard";
    }

    @GetMapping("/daily")
    public String showDaily() {
        return "daily"; // 빈 템플릿 반환
    }


    @GetMapping("/wordbook-list")
    public String showWordBookList() {
        return "wordbook-list";
    }

    @GetMapping("/wordbook-create")
    public String showWordBookRegister() {
        return "wordbook-create";
    }

    @GetMapping("/register-all")
    public String showWordBook() {
        return "book-register";
    }
}
