package com.adam9e96.wordlol.aop;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 *     <li>예외 발생 시 - 예외 정보</li>
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
 *
 * [계층 Layer] ❌ 예외 발생 ====================
 * >> 위치: 클래스명.메서드명
 * >> 예외 타입: 예외클래스명
 * >> 예외 메시지: 메시지
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
        // 클래스 및 메서드 정보 가져오기
        String methodName = joinPoint.getSignature().getName();
        String className = getSimpleClassName(joinPoint);
        String type = className.contains("Controller") ? "Controller" : "Service";

        // 스레드 정보 추가 (멀티스레드 환경에서 디버깅 용이)
        String threadInfo = Thread.currentThread().getName();

        // 요청 파라미터 로깅
        String params = convertToJson(joinPoint.getArgs());
        params = truncateLog(params, 500); // 너무 긴 경우 잘라서 표시

        log.info("""
                [{}] [{} Layer] ▶️ 메서드 시작 ====================
                >> 위치: {}.{}
                >> 파라미터: {}
                """, threadInfo, type, className, methodName, params);

        long startTime = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;

            // 결과 데이터 로깅
            String resultStr = convertToJson(result);
            resultStr = truncateLog(resultStr, 500); // 너무 긴 경우 잘라서 표시

            log.info("""
                    [{}] [{} Layer] ⬅️ 메서드 종료 ====================
                    >> 위치: {}.{}
                    >> 실행시간: {}ms
                    >> 반환값: {}
                    """, threadInfo, type, className, methodName, executionTime, resultStr);
            return result;

        } catch (Throwable e) {
            log.error("""
                    [{}] [{} Layer] ❌ 예외 발생 ====================
                    >> 위치: {}.{}
                    >> 예외 타입: {}
                    >> 예외 메시지: {}
                    """, threadInfo, type, className, methodName, e.getClass().getSimpleName(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * JSON 변환 함수 - 변환 실패 시 기본 toString() 사용
     */
    private String convertToJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.warn("JSON 변환 실패: {}", e.getMessage());
            return object != null ? object.toString() : "null";
        }
    }

    /**
     * 클래스 이름을 안전하게 가져오는 메서드 (익명 클래스 고려)
     */
    private String getSimpleClassName(ProceedingJoinPoint joinPoint) {
        Class<?> clazz = joinPoint.getSignature().getDeclaringType();
        String className = clazz.getSimpleName();
        if (className.isEmpty()) {
            return clazz.getName(); // 익명 클래스의 경우 전체 이름 사용
        }
        return className;
    }

    /**
     * 너무 긴 로그를 일정 길이로 제한하여 출력
     */
    private String truncateLog(String log, int maxLength) {
        if (log.length() > maxLength) {
            return log.substring(0, maxLength) + "...(생략됨)";
        }
        return log;
    }
}
