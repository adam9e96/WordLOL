package com.adam9e96.wordlol.exception.wordbook;

import com.adam9e96.wordlol.exception.base.BaseException;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class WordBookEmptyException extends BaseException {
    private static final String MESSAGE = "단어장이 존재하지 않습니다.";
    private static final String CODE = "WORDBOOK-404";

    public WordBookEmptyException() {
        super(HttpStatus.NOT_FOUND, MESSAGE, CODE);
    }

    public WordBookEmptyException(Long wordBookId) {
        super(
                HttpStatus.NOT_FOUND,
                String.format("%s wordBookId: %d", MESSAGE, wordBookId),
                CODE
        );
    }
}
