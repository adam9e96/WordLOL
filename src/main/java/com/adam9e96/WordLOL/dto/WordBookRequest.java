package com.adam9e96.WordLOL.dto;

import com.adam9e96.WordLOL.entity.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

// 단어장 요청 DTO
public record WordBookRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull Category category,
        List<WordRequest> words
) {
}
