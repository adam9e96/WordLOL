package com.adam9e96.WordLOL.entity;

import lombok.Getter;

@Getter
public enum Category {
    TOEIC("토익"),
    TOEFL("토플"),
    TOEIC_SPEAKING("토익 스피킹"),
    TOEFL_SPEAKING("토플 스피킹"),
    BASIC("기초 영어"),
    INTERMEDIATE("중급 영어"),
    ADVANCED("고급 영어"),
    CUSTOM("커스텀");

    private final String description;

    Category(String description) {
        this.description = description;
    }

}
