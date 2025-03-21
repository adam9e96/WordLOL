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

/**
 * 통합 로깅을 위한 AOP(Aspect-Oriented Programming) 컴포넌트입니다.
 * Controller 와 Service 계층의 메서드 실행을 로깅합니다.
 *
 * <p>
 * 이 Aspect 는 Controller 와 Service 계층의 메서드 실행을 가로채서 일관된 형식으로 정보를 로깅합니다.
 * </p>
 * <ul>
 *     <li>메서드 실행 시작 시 - 메서드 메타데이터, 입력 파라미터</li>
 *     <li>메서드 실행 조료 시 - 실행 시간, 반환값</li>
 * </ul>
 * <p>
 *     모든 객체 파라미터와 반환값은 JSON 형식으로 변환되어 로깅됩니다.
 * </p>
 * <p>
 *     로그 메시지 출력 예시
 * </p>
 * <pre>
 * [계층 Layer] ▶️ 메서드 시작 ====================
 * >> 위치: 클래스명.메서드명
 * >> 파라미터: 파라미터값(JSON)
 *
 * [계층 Layer] ⬅️ 메서드 종료 ====================
 * >> 위치: 클래스명.메서드명
 * >> 실행시간: 밀리초
 * >> 반환값: 결과값(JSON)
 * </pre>
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
     * 단, HttpSession 및 HttpServletRequest 객체는 변환하지 않음
     * 이유) HttpSession 및 HttpServletRequest 객체는 JSON으로 변환할 수 없거나, 변환 시 무한 루프에 빠질 수 있음
     */
    private String convertToJson(Object object) {
        if (object instanceof HttpSession || object instanceof HttpServletRequest) {
            return "[HttpSession/Request - JSON 변환 건너뜀]";
        }

        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.warn("JSON 변환 실패: {}", e.getMessage());
            return object != null ? object.toString() : "null";
        }
    }

}
