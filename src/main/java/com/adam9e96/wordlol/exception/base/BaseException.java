package com.adam9e96.wordlol.exception.base;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * BaseException
 * 모든 예외의 상위 클래스
 * status, message, code를 가지고 있음
 * status: HTTP 상태 코드
 * message: 예외 메시지
 * code: 예외 코드
 */
@Getter
public class BaseException extends RuntimeException {
    private final HttpStatus status;
    private final String message;
    private final String code;

    protected BaseException(HttpStatus status, String message, String code) {
        super(message);
        this.status = status;
        this.message = message;
        this.code = code;
    }
}
