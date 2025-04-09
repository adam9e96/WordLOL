package com.adam9e96.wordlol.controller.impl.view;

import com.adam9e96.wordlol.common.constants.Constants;
import com.adam9e96.wordlol.controller.interfaces.view.WordBookViewController;
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
        return "views/wordbook/book_create";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_BOOK_LIST)
    public String showWordBookListPage() {
        return "views/wordbook/book_list";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_BOOK_EDIT)
    public String showWordBookEditPage(@PathVariable("id") Long id) {
        return "views/wordbook/book_edit";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_BOOK_STUDY)
    public String showWordBookStudyPage(@PathVariable("id") Long id) {
        return "views/wordbook/book_study";
    }

    @Override
    @GetMapping(Constants.ViewPath.WORD_BOOK_VIEW)
    public String showWordBookViewPage(@PathVariable("id") Long id) {
        return "views/wordbook/book_view";
    }
}
