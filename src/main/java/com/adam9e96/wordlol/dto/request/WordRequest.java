package com.adam9e96.wordlol.dto.request;

import com.adam9e96.wordlol.common.constants.Constants;
import jakarta.validation.constraints.*;

public record WordRequest(
        Long id,

        @NotBlank(message = "단어를 입력해주세요.")
        @Pattern(regexp = Constants.Validation.VOCABULARY_PATTERN,
                message = "영단어는 영문자, 공백, 하이픈만 포함할 수 있습니다.")
        @Size(max = 100, message = "단어는 100자를 초과할 수 없습니다.")
        String vocabulary,

        @NotBlank(message = "뜻을 입력해주세요.")
        @Size(max = 100, message = "뜻은 100자를 초과할 수 없습니다.")
        String meaning,

        @Size(max = 100, message = "힌트는 100자를 초과할 수 없습니다.")
        String hint,

        @NotNull(message = "난이도를 입력해주세요.")
        @Min(value = 1, message = "난이도는 1 이상이어야 합니다.")
        @Max(value = 5, message = "난이도는 5 이하이어야 합니다.")
        Integer difficulty
) {
}
