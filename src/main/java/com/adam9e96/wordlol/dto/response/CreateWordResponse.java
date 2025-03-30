package com.adam9e96.wordlol.dto.response;

import java.time.LocalDateTime;

public record CreateWordResponse(
        String message,
        Long wordId,
        LocalDateTime timestamp
) {
}
