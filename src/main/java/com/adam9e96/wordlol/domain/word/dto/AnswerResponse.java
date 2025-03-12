package com.adam9e96.wordlol.domain.word.dto;

public record AnswerResponse(
        boolean correct,
        String message,
        Integer perfectRun
) {
}
