package com.adam9e96.wordlol.exception.handler;

import com.adam9e96.wordlol.dto.ErrorResponse;
import com.adam9e96.wordlol.exception.base.BaseException;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.word.WordNotFoundException;
import com.adam9e96.wordlol.exception.wordbook.WordBookNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

/**
 * GlobalExceptionHandler
 * 전역 예외 처리 핸들러
 * BaseException, WordNotFoundException, WordBookNotFoundException, ValidationException을 처리
 * 
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException e) {
        log.error("BaseException 발생: {}", e.getMessage(), e);

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                e.getStatus().value(),
                e.getMessage(),
                List.of(e.getCode())
        );
        return ResponseEntity
                .status(e.getStatus())
                .body(response);
    }

    @ExceptionHandler(WordNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleWordNotFound(WordNotFoundException e) {
        log.error("WordNotFoundException occurred: {}", e.getMessage(), e);

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                e.getStatus().value(),
                e.getMessage(),
                List.of(e.getCode())
        );

        return ResponseEntity
                .status(e.getStatus())
                .body(response);
    }

    @ExceptionHandler(WordBookNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleWordBookNotFound(WordBookNotFoundException e) {
        log.error("WordBookNotFoundException occurred: {}", e.getMessage(), e);

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                e.getStatus().value(),
                e.getMessage(),
                List.of(e.getCode())
        );

        return ResponseEntity
                .status(e.getStatus())
                .body(response);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
        log.error("ValidationException occurred: {}", e.getMessage(), e);

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                e.getStatus().value(),
                e.getMessage(),
                List.of(e.getCode())
        );

        return ResponseEntity
                .status(e.getStatus())
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException e) {
        log.error("Validation error occurred: {}", e.getMessage(), e);

        List<String> errors = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                400,
                "입력값 검증에 실패했습니다",
                errors
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllUncaughtException(Exception e) {
        log.error("Uncaught exception occurred: {}", e.getMessage(), e);

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                500,
                "서버 내부 오류가 발생했습니다",
                List.of("INTERNAL-SERVER-ERROR")
        );

        return ResponseEntity.internalServerError().body(response);
    }
}
