package com.adam9e96.wordlol.exception.wordbook;

import com.adam9e96.wordlol.exception.base.BaseException;
import org.springframework.http.HttpStatus;

public class WordBookDeletionException extends BaseException {
    private static final String MESSAGE = "단어장 삭제 중 오류가 발생했습니다.";
    private static final String CODE = "WORDBOOK-400";

    public WordBookDeletionException() {
        super(
                HttpStatus.BAD_REQUEST,
                MESSAGE, CODE);
    }
}
