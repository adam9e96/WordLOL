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
    @GetMapping("/study")
    public String showStudyPage() {
        return "word/study";
    }

    @Override
    @GetMapping("/register")
    public String showRegisterPage() {
        return "word/register";
    }

    @Override
    @GetMapping("/words/register")
    public String showWordsRegisterPage() {
        return "words/register";
    }

    @Override
    @GetMapping("/list")
    public String showListPage() {
        return "word/list";
    }

    @Override
    @GetMapping("/dashboard")
    public String showDashboardPage() {
        return "dashboard";
    }

    @Override
    @GetMapping("/daily")
    public String showDailyPage() {
        return "daily";
    }

    @Override
    @GetMapping("/wordbook/create")
    public String showWordBookCreatePage() {
        return "wordbook/create";
    }

    @Override
    @GetMapping("/wordbook/list")
    public String showWordBookListPage() {
        return "wordbook/list";
    }

    @Override
    @GetMapping("/wordbook/{id}/edit")
    public String showWordBookEditPage(@PathVariable("id") Long id, Model model) {
        model.addAttribute("wordBookId", id);
        return "wordbook/edit";
    }

    @Override
    @GetMapping("/wordbook/{id}/study")
    public String showWordBookStudyPage(@PathVariable("id") Long id, Model model) {
        model.addAttribute("wordBookId", id);
        return "wordbook/study";
    }
}
