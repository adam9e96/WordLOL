package com.adam9e96.wordlol.dto;

public record AnswerRequest(
        String answer,
        Long wordId
) {
}
