package com.adam9e96.wordlol.exception.wordbook;

import com.adam9e96.wordlol.exception.base.BaseException;
import org.springframework.http.HttpStatus;

public class WordBookNotFoundException extends BaseException {
    private static final String MESSAGE = "단어장을 찾을 수 없습니다.";
    private static final String CODE = "WORDBOOK-404";

    public WordBookNotFoundException(Long wordBookId) {
        super(HttpStatus.NOT_FOUND, String.format("%s wordBookId: %d", MESSAGE, wordBookId), CODE);
    }
}
