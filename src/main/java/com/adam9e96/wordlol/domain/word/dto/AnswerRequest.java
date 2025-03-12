package com.adam9e96.wordlol.domain.word.dto;

public record AnswerRequest(
        String answer,
        Long wordId
) {
}
