package com.adam9e96.wordlol.enums;

import lombok.Getter;

/**
 * 단어의 카테고리를 나타내는 Enum
 * TOEIC, TOEFL, CSAT, CUSTOM
 */
@Getter
public enum Category {
    TOEIC("토익"),
    TOEFL("토플"),
    CSAT("수능"),  // 추가
    CUSTOM("사용자 정의");

    private final String description;


    Category(String description) {
        this.description = description;
    }

}