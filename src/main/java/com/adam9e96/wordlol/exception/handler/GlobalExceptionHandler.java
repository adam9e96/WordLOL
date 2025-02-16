package com.adam9e96.wordlol.exception.handler;

import com.adam9e96.wordlol.dto.ErrorResponse;
import com.adam9e96.wordlol.exception.base.BaseException;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.word.WordCreationException;
import com.adam9e96.wordlol.exception.word.WordDeletionException;
import com.adam9e96.wordlol.exception.word.WordNotFoundException;
import com.adam9e96.wordlol.exception.word.WordUpdateException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * GlobalExceptionHandler
 * 전역 예외 처리 핸들러
 * BaseException, WordNotFoundException, WordBookNotFoundException, ValidationException을 처리
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

        return ResponseEntity.status(e.getStatus()).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllUncaughtException(Exception e) {
        log.error("Uncaught exception 발생: {}", e.getMessage(), e);

        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "서버 내부 오류가 발생했습니다",
                List.of("INTERNAL-SERVER-ERROR")
        );

        return ResponseEntity.internalServerError().body(response);
    }

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


    /**
     * @param e
     * @return
     */
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

    /**
     * Spring의 @Valid와 관련된 자동 검증 실패 시 발생
     * 주로 request DTO의 어노테이션 기반 검증에서 사용
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .toList();

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "유효성 검증 실패",
                errors
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }


    // GlobalExceptionHandler에 추가
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
}