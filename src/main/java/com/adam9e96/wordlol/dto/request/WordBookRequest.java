package com.adam9e96.wordlol.dto.request;

import com.adam9e96.wordlol.enums.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

// 단어장 생성 요청 DTO
public record WordBookRequest(
        @NotBlank(message = "단어장 이름은 필수입니다")
        String name,

        @NotBlank(message = "단어장 설명은 필수입니다")
        String description,

        @NotNull(message = "카테고리는 필수입니다")
        Category category,

        List<WordRequest> words
) {
}
