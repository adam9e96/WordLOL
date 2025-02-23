package com.adam9e96.wordlol.dto;

public record DailyWordResponse(
        String vocabulary,
        String meaning,
        Integer difficulty
) {
}
