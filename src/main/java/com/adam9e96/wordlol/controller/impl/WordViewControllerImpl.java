package com.adam9e96.wordlol.controller.impl;

import com.adam9e96.wordlol.controller.interfaces.WordViewController;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/word")
@AllArgsConstructor
public class WordViewControllerImpl implements WordViewController {

    @Override
    @GetMapping("/study")
    public String showStudyPage() {
        return "views/word/study";
    }

    @Override
    @GetMapping("/register")
    public String showRegisterPage() {
        return "views/word/register";
    }

    @Override
    @GetMapping("/words/register")
    public String showWordsRegisterPage() {
        return "views/words/register";
    }

    @Override
    @GetMapping("/list")
    public String showListPage() {
        return "views/word/list";
    }

    @Override
    @GetMapping("/dashboard")
    public String showDashboardPage() {
        return "views/dashboard";
    }

    @Override
    @GetMapping("/daily")
    public String showDailyPage() {
        return "views/word/daily";
    }

    @Override
    @GetMapping("/search")
    public String showSearchResultsPage(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            Model model) {

        model.addAttribute("keyword", keyword);
        model.addAttribute("page", page);

        return "views/word/search";
    }


    @Override
    @GetMapping("/wordbook/create")
    public String showWordBookCreatePage() {
        return "views/wordbook/create";
    }

    @Override
    @GetMapping("/wordbook/list")
    public String showWordBookListPage() {
        return "views/wordbook/list";
    }

    @Override
    @GetMapping("/wordbook/{id}/edit")
    public String showWordBookEditPage(@PathVariable("id") Long id, Model model) {
        model.addAttribute("wordBookId", id);
        return "views/wordbook/edit";
    }

    @Override
    @GetMapping("/wordbook/{id}/study")
    public String showWordBookStudyPage(@PathVariable("id") Long id, Model model) {
        model.addAttribute("wordBookId", id);
        return "views/wordbook/study";
    }

    @Override
    @GetMapping("/wordbook/{id}/view")
    public String showWordBookViewPage(@PathVariable("id") Long id, Model model) {
        model.addAttribute("wordBookId", id);
        return "views/wordbook/view";
    }


    @GetMapping("/test")
    public String showTestPage() {
        return "fragments/test";
    }
}
