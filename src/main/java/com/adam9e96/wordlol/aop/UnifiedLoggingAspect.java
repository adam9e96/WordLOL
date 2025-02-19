package com.adam9e96.wordlol.aop;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
@Aspect
@Component
public class UnifiedLoggingAspect {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Pointcut("execution(* com.adam9e96.wordlol.controller..*(..))")
    private void controllerMethods() {}

    @Pointcut("execution(* com.adam9e96.wordlol.service..*(..))")
    private void serviceMethods() {}

    /**
     * Controller와 Service 계층의 메서드 실행을 로깅합니다.
     */
    @Around("controllerMethods() || serviceMethods()")
    public Object logMethodExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String type = className.contains("Controller") ? "Controller" : "Service";

        // 입력 파라미터 로깅
        String params = Arrays.stream(joinPoint.getArgs())
                .map(arg -> {
                    try {
                        return objectMapper.writeValueAsString(arg);
                    } catch (Exception e) {
                        return arg.toString();
                    }
                })
                .collect(Collectors.joining(", "));

        // 시작 로그
        log.info("\n[{} Layer] ▶️ 메서드 시작 ====================" +
                        "\n>> 위치: {}.{}" +
                        "\n>> 파라미터: {}",
                type, className, methodName, params);

        try {
            // 메서드 실행 및 처리 시간 측정
            long startTime = System.currentTimeMillis();
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;

            // 결과 데이터 로깅
            String resultStr;
            try {
                resultStr = objectMapper.writeValueAsString(result);
            } catch (Exception e) {
                resultStr = result != null ? result.toString() : "null";
            }

            // 종료 로그
            log.info("\n[{} Layer] ⬅️ 메서드 종료 ====================" +
                            "\n>> 위치: {}.{}" +
                            "\n>> 실행시간: {}ms" +
                            "\n>> 반환값: {}",
                    type, className, methodName, executionTime, resultStr);

            return result;

        } catch (Throwable e) {
            // 예외 발생 시 로깅
            log.error("\n[{} Layer] ❌ 예외 발생 ====================" +
                            "\n>> 위치: {}.{}" +
                            "\n>> 예외 타입: {}" +
                            "\n>> 예외 메시지: {}",
                    type, className, methodName,
                    e.getClass().getSimpleName(), e.getMessage(), e);
            throw e;
        }
    }
}
