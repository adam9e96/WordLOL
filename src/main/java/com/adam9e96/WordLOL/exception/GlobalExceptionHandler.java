//package com.adam9e96.WordLOL.exception;
//
//import com.adam9e96.WordLOL.dto.ErrorResponse;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.MethodArgumentNotValidException;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@RestControllerAdvice
//public class GlobalExceptionHandler {
//
//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
//        List<String> errors = ex.getBindingResult()
//                .getFieldErrors()
//                .stream()
//                .map(error -> error.getField() + ": " + error.getDefaultMessage())
//                .toList();
//
//        ErrorResponse errorResponse = new ErrorResponse(
//                LocalDateTime.now(),
//                HttpStatus.BAD_REQUEST.value(),
//                "입력값 검증 실패",
//                errors
//        );
//
//        return ResponseEntity
//                .badRequest()
//                .body(errorResponse);
//    }
//}
//
