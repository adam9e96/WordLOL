package com.adam9e96.wordlol.common.exception.wordbook;

import com.adam9e96.wordlol.common.exception.base.BaseException;
import org.springframework.http.HttpStatus;

public class WordBookCreationException extends BaseException {
    private static final String MESSAGE = "단어장 생성 중 오류가 발생했습니다.";
    private static final String CODE = "WORDBOOK-400";

    public WordBookCreationException() {
        super(HttpStatus.BAD_REQUEST,
                MESSAGE, CODE);
    }
}
