package com.adam9e96.wordlol.domain.wordbook.dto;

public record WordBookStudyResponse(
        Long id,
        String vocabulary,
        String meaning,
        String hint,
        Integer difficulty
) {

}
