package com.adam9e96.wordlol.aop;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * 통합 로깅을 위한 AOP(Aspect-Oriented Programming) 컴포넌트입니다.
 * Controller 와 Service 계층의 메서드 실행을 로깅합니다.
 */
@Slf4j
@Aspect
@RequiredArgsConstructor
@Component
public class CommonLoggingAspect {

    private final ObjectMapper objectMapper;

    @Pointcut("execution(* com.adam9e96.wordlol.controller..*(..))")
    private void controllerMethods() {
        // com.adam9e96.wordlol.controller 패키지 내의 모든 메서드를 포인트컷으로 지정
    }

    @Pointcut("execution(* com.adam9e96.wordlol.service..*(..))")
    private void serviceMethods() {
        // com.adam9e96.wordlol.service 패키지 내의 모든 메서드를 포인트컷으로 지정
    }


    @Around("controllerMethods() || serviceMethods()")
    public Object logMethodExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        // 메서드 이름 가져오기
        String methodName = joinPoint.getSignature().getName();
        // 클래스 이름 가져오기
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        // 클래스 이름에 따라 타입 설정 (Controller 또는 Service)
        String type = className.contains("Controller") ? "Controller" : "Service";
        // 요청 파라미터 로깅
        String params = convertToJson(joinPoint.getArgs());

        log.info("""
                [{} Layer] ▶️ 메서드 시작 ====================
                >> 위치: {}.{}
                >> 파라미터: {}
                """, type, className, methodName, params);

        long startTime = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long executionTime = System.currentTimeMillis() - startTime;

        // 결과 데이터 로깅
        String resultStr = convertToJson(result);

        log.info("""
                [{} Layer] ⬅️ 메서드 종료 ====================
                >> 위치: {}.{}
                >> 실행시간: {}ms
                >> 반환값: {}
                """, type, className, methodName, executionTime, resultStr);
        return result;
    }

    /**
     * JSON 변환 함수 - 변환 실패 시 기본 toString() 사용
     * HttpSession과 HttpServletRequest 같은 직렬화하기 어려운 객체는 특별히 처리
     */
    private String convertToJson(Object object) {
        if (object == null) {
            return "null";
        }

        // HttpSession이나 HttpServletRequest 객체 처리
        if (object instanceof HttpSession || object instanceof HttpServletRequest) {
            return "[HTTP 세션/요청 객체 - JSON 변환 생략]";
        }

        // 배열이나 컬렉션 객체를 감지하고 내부 요소가 복잡한 객체면 특별 처리
        if (object.getClass().isArray()) {
            Object[] array = (Object[]) object;

            // 배열 내 요소가 HttpSession이나 HttpServletRequest인지 확인
            boolean hasComplexObjects = Arrays.stream(array)
                    .anyMatch(item -> item instanceof HttpSession || item instanceof HttpServletRequest);

            if (hasComplexObjects) {
                return "[HTTP 세션/요청 객체를 포함한 배열 - JSON 변환 생략]";
            }
        }

        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.warn("JSON 변환 실패: {}", e.getMessage());

            // 배열인 경우 각 요소의 toString()을 사용하여 문자열로 변환
            if (object.getClass().isArray()) {
                return Arrays.stream((Object[]) object)
                        .map(item -> item != null ? item.toString() : "null")
                        .collect(Collectors.joining(", ", "[", "]"));
            }

            return object.toString();
        }
    }
}