package com.adam9e96.wordlol.controller.interfaces;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

public interface WordViewController {
    @GetMapping("/study")
    String showStudyPage();

    @GetMapping("/register")
    String showRegisterPage();

    @GetMapping("/words/register")
    String showWordsRegisterPage();

    @GetMapping("/list")
    String showListPage();

    @GetMapping("/dashboard")
    String showDashboardPage();

    @GetMapping("/daily")
    String showDailyPage();

    @GetMapping("/wordbook/create")
    String showWordBookCreatePage();

    @GetMapping("/wordbook/list")
    String showWordBookListPage();

    @GetMapping("/wordbook/{id}/edit")
    String showWordBookEditPage(@PathVariable("id") Long id, Model model);

    @GetMapping("/wordbook/{id}/study")
    String showWordBookStudyPage(@PathVariable("id") Long id, Model model);
}
