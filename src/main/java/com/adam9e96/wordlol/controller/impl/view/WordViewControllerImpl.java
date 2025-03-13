package com.adam9e96.wordlol.controller.impl.view;

import com.adam9e96.wordlol.common.constants.Constants;
import com.adam9e96.wordlol.controller.interfaces.view.WordViewController;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping(Constants.ViewPath.WORD_BASE)
@AllArgsConstructor
public class WordViewControllerImpl implements WordViewController {

    @Override
    @GetMapping(Constants.ViewPath.STUDY)
    public String showStudyPage() {
        return "views/word/study";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_REGISTER)
    public String showRegisterPage() {
        return "views/word/register";
    }

    @Override
    @GetMapping("/words/register")
    public String showWordsRegisterPage() {
        return "views/words/register";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_LIST)
    public String showListPage() {
        return "views/word/list";
    }

    @Override
    @GetMapping(Constants.ViewPath.DASHBOARD)
    public String showDashboardPage() {
        return "views/dashboard";
    }

    @Override
    @GetMapping(Constants.ViewPath.DAILY)
    public String showDailyPage() {
        return "views/word/daily";
    }

    @Override
    @GetMapping(Constants.ViewPath.SEARCH)
    public String showSearchResultsPage(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            Model model) {

        model.addAttribute("keyword", keyword);
        model.addAttribute("page", page);

        return "views/word/search";
    }
}
