package com.adam9e96.wordlol.exception.handler;

import com.adam9e96.wordlol.dto.ErrorResponse;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.word.WordCreationException;
import com.adam9e96.wordlol.exception.word.WordDeletionException;
import com.adam9e96.wordlol.exception.word.WordNotFoundException;
import com.adam9e96.wordlol.exception.word.WordUpdateException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * GlobalExceptionHandler
 * 전역 예외 처리 핸들러
 * BaseException, WordNotFoundException, WordBookNotFoundException, ValidationException 을 처리
 */
@Slf4j
@RestControllerAdvice(basePackages = "com.adam9e96.wordlol.controller.WordRestController")
public class WordExceptionHandler {

    @ExceptionHandler(WordNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleWordNotFound(WordNotFoundException e) {
        log.error("단어를 찾을 수 없음: {}", e.getMessage(), e);
        // 발생한 예외를 잡아서 적절한 에러 응답으로 변환
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                e.getStatus().value(),
                e.getMessage(),
                List.of(e.getCode())
        );
        return ResponseEntity.status(e.getStatus()).body(response);
    }


    @ExceptionHandler(WordCreationException.class)
    public ResponseEntity<ErrorResponse> handleWordCreation(WordCreationException e) {
        log.error("단어 생성 실패: {}", e.getMessage(), e);

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

    // GlobalExceptionHandler 에 추가
    @ExceptionHandler(WordUpdateException.class)
    public ResponseEntity<ErrorResponse> handleWordUpdateException(WordUpdateException ex) {
        log.error("단어 수정 중 오류 발생: {}", ex.getMessage(), ex);
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                ex.getStatus().value(),
                ex.getMessage(),
                Collections.singletonList(ex.getMessage())
        );

        return new ResponseEntity<>(errorResponse, ex.getStatus());
    }

    @ExceptionHandler(WordDeletionException.class)
    public ResponseEntity<ErrorResponse> handleWordDeletion(WordDeletionException e) {
        log.error("단어 삭제 중 오류 발생: {}", e.getMessage(), e);

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
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "유효성 검증 실패",
                Collections.singletonList(ex.getMessage())
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}