package com.adam9e96.wordlol.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

public record WordRequest(
        @Schema(description = "단어 ID", example = "1")
        Long id,

        @Schema(description = "영단어", example = "apple")
        @NotBlank(message = "단어를 입력해주세요.")
        @Pattern(regexp = "^[a-zA-Z\\s]*$", message = "영단어는 영문자, 공백, 하이픈만 포함할 수 있습니다")
        @Size(min = 1, max = 100, message = "단어는 1자 이상 100자 이하로 입력해주세요")
        String vocabulary,

        @NotBlank(message = "뜻은 필수 입력값입니다")
        @Size(min = 1, max = 100, message = "뜻은 1자 이상 100자 이하로 입력해주세요")
        String meaning,

        @Size(max = 100, message = "힌트는 100자 이하로 입력해주세요")
        String hint,

        @Min(value = 1, message = "난이도는 1 이상이어야 합니다")
        @Max(value = 5, message = "난이도는 5 이하이어야 합니다")
        @NotNull(message = "난이도는 필수 입력값입니다")
        Integer difficulty
) {
}
