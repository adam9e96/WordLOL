package com.adam9e96.wordlol.dto.response;

public record WordBookStudyResponse(
        Long id,
        String vocabulary,
        String meaning,
        String hint,
        Integer difficulty
) {

}
