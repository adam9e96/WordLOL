package com.adam9e96.wordlol.dto;

import jakarta.validation.constraints.*;

public record WordRequest(
        Long id,
        @NotBlank(message = "단어는 필수 입력값입니")
        @Pattern(regexp = "^[a-zA-Z]*$", message = "영단어는 영문자, 공백, 하이픈만 포함할 수 있습니다")
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
