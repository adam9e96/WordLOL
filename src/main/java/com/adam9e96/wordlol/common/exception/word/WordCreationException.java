package com.adam9e96.wordlol.common.exception.word;

import com.adam9e96.wordlol.common.exception.base.BaseException;
import org.springframework.http.HttpStatus;

public class WordCreationException extends BaseException {
    private static final String MESSAGE = "단어를 생성하는 중에 문제가 발생했습니다.";
    private static final String CODE = "WORD-500";

    public WordCreationException(Long wordId) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, String.format("%s wordId: %d", MESSAGE, wordId), CODE);
    }
}
