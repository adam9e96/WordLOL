package com.adam9e96.WordLOL.entity;

import lombok.Getter;

@Getter
public enum Category {
    TOEIC("토익"),
    TOEFL("토플"),
    CSAT("수능"),  // 추가
    TOEIC_SPEAKING("토익스피킹"),
    BASIC("기초"),
    INTERMEDIATE("중급"),
    ADVANCED("고급"),
    CUSTOM("사용자 정의");

    private final String description;


    Category(String description) {
        this.description = description;
    }

}