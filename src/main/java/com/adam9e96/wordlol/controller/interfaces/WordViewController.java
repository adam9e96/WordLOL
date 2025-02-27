package com.adam9e96.wordlol.controller.interfaces;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

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

    @GetMapping("/search")
    String showSearchResultsPage(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            Model model);

    @GetMapping("/wordbook/create")
    String showWordBookCreatePage();

    @GetMapping("/wordbook/list")
    String showWordBookListPage();

    @GetMapping("/wordbook/{id}/edit")
    String showWordBookEditPage(@PathVariable("id") Long id, Model model);

    @GetMapping("/wordbook/{id}/study")
    String showWordBookStudyPage(@PathVariable("id") Long id, Model model);

    @GetMapping("/wordbook/{id}/view")
    String showWordBookViewPage(@PathVariable("id") Long id, Model model);
}
