package com.adam9e96.WordLOL.dto;

public record WordResponse(
        Long id,
        String vocabulary,
        String meaning,
        String hint
) {
}

