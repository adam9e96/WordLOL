package com.adam9e96.wordlol.exception.word;

import com.adam9e96.wordlol.exception.base.BaseException;
import org.springframework.http.HttpStatus;

public class WordDeletionException extends BaseException {
    private static final String MESSAGE = "단어를 삭제하는 중에 문제가 발생했습니다.";
    private static final String CODE = "WORD-500";

    public WordDeletionException(Long wordId) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, String.format("%s wordId: %d", MESSAGE, wordId), CODE);
    }
}
