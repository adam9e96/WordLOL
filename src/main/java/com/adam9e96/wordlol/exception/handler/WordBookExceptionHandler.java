package com.adam9e96.wordlol.exception.handler;

import com.adam9e96.wordlol.dto.ErrorResponse;
import com.adam9e96.wordlol.exception.wordbook.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestControllerAdvice(basePackages = "com.adam9e96.wordlol.controller.WordBookRestController")
public class WordBookExceptionHandler {

    @ExceptionHandler(WordBookNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleWordBookNotFound(WordBookNotFoundException e) {
        log.error("단어장을 찾을 수 없음: {}", e.getMessage(), e);
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                e.getStatus().value(),
                e.getMessage(),
                List.of(e.getCode())
        );
        return ResponseEntity.status(e.getStatus()).body(response);
    }

    @ExceptionHandler(WordBookCreationException.class)
    public ResponseEntity<ErrorResponse> handleWordBookCreation(WordBookCreationException e) {
        log.error("단어장 생성 실패: {}", e.getMessage(), e);
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                e.getStatus().value(),
                e.getMessage(),
                List.of(e.getCode())
        );
        return ResponseEntity.status(e.getStatus()).body(response);
    }

    @ExceptionHandler(WordBookUpdateException.class)
    public ResponseEntity<ErrorResponse> handleWordBookUpdate(WordBookUpdateException e) {
        log.error("단어장 수정 실패: {}", e.getMessage(), e);
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                e.getStatus().value(),
                e.getMessage(),
                List.of(e.getCode())
        );
        return ResponseEntity.status(e.getStatus()).body(response);
    }

    @ExceptionHandler(WordBookDeletionException.class)
    public ResponseEntity<ErrorResponse> handleWordBookDeletion(WordBookDeletionException e) {
        log.error("단어장 삭제 실패: {}", e.getMessage(), e);
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                e.getStatus().value(),
                e.getMessage(),
                List.of(e.getCode())
        );
        return ResponseEntity.status(e.getStatus()).body(response);
    }

}
