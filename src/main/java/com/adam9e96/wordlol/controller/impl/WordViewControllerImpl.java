package com.adam9e96.wordlol.controller.impl;

import com.adam9e96.wordlol.controller.interfaces.WordViewController;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/word")
@AllArgsConstructor
public class WordViewControllerImpl implements WordViewController {

    @Override
    @RequestMapping("/study")
    public String showStudy() {
        return "study";
    }

    @Override
    @GetMapping("/register")
    public String showRegister() {
        return "word-register";
    }

    @Override
    @GetMapping("/list")
    public String showList() {
        return "word-list";
    }

    @Override
    @GetMapping("/dashboard")
    public String showMain() {
        return "dashboard";
    }

    @Override
    @GetMapping("/daily")
    public String showDaily() {
        return "daily"; // 빈 템플릿 반환
    }

    @Override
    @GetMapping("/wordbook-list")
    public String showWordBookList() {
        return "wordbook-list";
    }

    @Override
    @GetMapping("/wordbook-create")
    public String showWordBookRegister() {
        return "wordbook-create";
    }

    @Override
    @GetMapping("/register-all")
    public String showWordBook() {
        return "words-register";
    }

    @Override
    @GetMapping("/wordbook/edit/{id}")
    public String showWordBookEdit(@PathVariable("id") Long id, Model model) {
        model.addAttribute("wordBookId", id);
        return "wordbook-edit";
    }

    @Override
    @GetMapping("/study/{wordBookId}")
    public String showWordBookStudy(@PathVariable("wordBookId") Long wordBookId, Model model) {
        model.addAttribute("wordBookId", wordBookId);
        return "wordbook-study";
    }
}
