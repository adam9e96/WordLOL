package com.adam9e96.wordlol.exception.word;

import com.adam9e96.wordlol.exception.base.BaseException;
import org.springframework.http.HttpStatus;

public class WordNotFoundException extends BaseException {
    private static final String MESSAGE = "단어를 찾을 수 없습니다.";
    private static final String CODE = "WORD-404";

    public WordNotFoundException(Long wordId) {
        super(
                HttpStatus.NOT_FOUND,                              // 404 상태 코드
                String.format("%s wordId: %d", MESSAGE, wordId),  // "단어를 찾을 수 없습니다. wordId: 123"
                CODE                                              // "WORD-404"
        );
    }
}
