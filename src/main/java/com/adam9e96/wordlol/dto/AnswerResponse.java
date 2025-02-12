package com.adam9e96.wordlol.dto;

public record AnswerResponse(
        boolean correct,
        String message,
        Integer perfectRun
) {
}
