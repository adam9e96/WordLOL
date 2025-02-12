package com.adam9e96.wordlol.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class LoggingAspect {

    /**
     * 모든 서비스 메서드 실행 전에 로그 출력
     */
    @Before("execution(* com.adam9e96.wordlol.service.*(..))")  // 서비스 계층에 적용
    public void logBeforeMethod(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        String methodTypeName = joinPoint.getSignature().getDeclaringTypeName();
        Object[] methodArgs = joinPoint.getArgs();

        log.info("메소드 호출됨 : {}.{}() 파라미터 : {}",
                methodTypeName,
                methodName,
                methodArgs);
    }

    /**
     * 모든 컨트롤러 메서드 실행 후 로그 출력
     */
    @AfterReturning(pointcut = "execution(* com.adam9e96.wordlol.controller..*(..))", returning = "result")
    public void logAfterMethod(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        String methodTypeName = joinPoint.getSignature().getDeclaringTypeName();
        log.info("메소드 호출됨 : {}.{}(), 반환값: {}",
                methodTypeName,
                methodName,
                result);
    }

    /**
     * 예외 발생 시 로그 출력
     */
    @AfterThrowing(pointcut = "execution(* com.adam9e96.wordlol.*(..))", throwing = "exception")
    public void logException(JoinPoint joinPoint, Throwable exception) {
        String methodName = joinPoint.getSignature().getName();
        String methodTypeName = joinPoint.getSignature().getDeclaringTypeName();
        log.error("Exception in {}.{}(), message: {}",
                methodTypeName,
                methodName,
                exception.getMessage(), exception);
    }

}
