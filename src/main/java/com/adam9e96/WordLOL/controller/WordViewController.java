package com.adam9e96.WordLOL.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/word")
public class WordViewController {

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

    @GetMapping("/")
    public String showMain() {
        return "dashboard";
    }


}
