package com.adam9e96.wordlol.dto.common;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 현재 로그인한 사용자를 주입받기 위한 어노테이션
 * JWT 토큰에서 추출한 사용자 정보를 컨트롤러 메서드에 주입
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
