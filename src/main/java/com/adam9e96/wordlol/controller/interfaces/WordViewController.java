package com.adam9e96.wordlol.controller.interfaces;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

public interface WordViewController {
    @GetMapping("/study")
    String showStudy();

    @GetMapping("/register")
    String showRegister();

    @GetMapping("/list")
    String showList();

    @GetMapping("/dashboard")
    String showMain();

    @GetMapping("/daily")
    String showDaily();

    @GetMapping("/wordbook-list")
    String showWordBookList();

    @GetMapping("/wordbook-create")
    String showWordBookRegister();

    @GetMapping("/register-all")
    String showWordBook();

    @GetMapping("/wordbook/edit/{id}")
    String showWordBookEdit(@PathVariable("id") Long id, Model model);

    @GetMapping("/study/{wordBookId}")
    String showWordBookStudy(@PathVariable("wordBookId") Long wordBookId, Model model);
}
