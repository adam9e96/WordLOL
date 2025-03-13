package com.adam9e96.wordlol.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record WordRequest(
        @Schema(description = "단어 ID", example = "1")
        Long id,
        @Schema(description = "영단어", example = "apple")
        String vocabulary,

        String meaning,

        String hint,

        Integer difficulty
) {
}
