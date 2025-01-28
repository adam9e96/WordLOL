package com.adam9e96.WordLOL.dto;

public record WordRequest(
        String vocabulary,
        String meaning,
        String hint
) {
}
