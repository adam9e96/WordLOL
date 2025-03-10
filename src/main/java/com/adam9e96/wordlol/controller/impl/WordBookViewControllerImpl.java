package com.adam9e96.wordlol.controller.impl;

import com.adam9e96.wordlol.common.Constants;
import com.adam9e96.wordlol.controller.interfaces.WordBookViewController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@Slf4j
@RequestMapping(Constants.ViewPath.WORD_BOOK_BASE)
public class WordBookViewControllerImpl implements WordBookViewController {
    @Override
    @GetMapping(Constants.ViewPath.WORD_BOOK_CREATE)
    public String showWordBookCreatePage() {
        return "views/wordbook/create";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_BOOK_LIST)
    public String showWordBookListPage() {
        return "views/wordbook/list";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_BOOK_EDIT)
    public String showWordBookEditPage(@PathVariable("id") Long id) {
        return "views/wordbook/edit";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_BOOK_STUDY)
    public String showWordBookStudyPage(@PathVariable("id") Long id) {
        return "views/wordbook/study";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_BOOK_VIEW)
    public String showWordBookViewPage(@PathVariable("id") Long id) {
        return "views/wordbook/view";
    }
}
