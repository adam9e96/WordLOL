package com.adam9e96.wordlol.common.exception.validation;

import com.adam9e96.wordlol.common.exception.base.BaseException;
import org.springframework.http.HttpStatus;

/**
 * ValidationException
 * 유효성 검사 실패 시 발생하는 예외
 */
public class ValidationException extends BaseException {
    private static final String CODE = "VALIDATION-400";

    public ValidationException(String message) {
        super(HttpStatus.BAD_REQUEST, message, CODE);
    }
}
