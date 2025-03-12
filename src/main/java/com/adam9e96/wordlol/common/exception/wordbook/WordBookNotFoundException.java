package com.adam9e96.wordlol.common.exception.wordbook;

import com.adam9e96.wordlol.entity.Category;
import com.adam9e96.wordlol.common.exception.base.BaseException;
import org.springframework.http.HttpStatus;

public class WordBookNotFoundException extends BaseException {
    private static final String MESSAGE = "단어장을 찾을 수 없습니다.";
    private static final String CODE = "WORDBOOK-404";
    private static final String MESSAGE_CATEGORY = "카테고리를 찾을 수 없습니다.";

    public WordBookNotFoundException(Long wordBookId) {
        super(HttpStatus.NOT_FOUND, String.format("%s wordBookId: %d", MESSAGE, wordBookId), CODE);
    }

    public WordBookNotFoundException(Category category) {
        super(HttpStatus.NOT_FOUND, String.format("%s category: %s", MESSAGE_CATEGORY, category), CODE);
    }
}
