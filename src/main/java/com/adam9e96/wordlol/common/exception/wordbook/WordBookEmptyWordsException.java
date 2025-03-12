package com.adam9e96.wordlol.common.exception.wordbook;

import com.adam9e96.wordlol.common.exception.base.BaseException;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class WordBookEmptyWordsException extends BaseException {
    private static final String MESSAGE = "단어장에 단어가 존재하지 않습니다.";
    private static final String CODE = "WORDBOOK-404";

    public WordBookEmptyWordsException() {
        super(HttpStatus.NOT_FOUND, MESSAGE, CODE);
    }

    public WordBookEmptyWordsException(Long wordBookId) {
        super(
                HttpStatus.NOT_FOUND,
                String.format("%s wordBookId: %d", MESSAGE, wordBookId),
                CODE
        );
    }
}
