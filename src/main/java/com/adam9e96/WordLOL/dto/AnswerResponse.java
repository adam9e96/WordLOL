package com.adam9e96.WordLOL.dto;

public record AnswerResponse(
        boolean correct,
        String message,
        Integer streak
) {
}
