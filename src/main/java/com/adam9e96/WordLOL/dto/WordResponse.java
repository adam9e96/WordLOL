package com.adam9e96.WordLOL.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// WordResponse.java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WordResponse {
    private boolean correct;
    private String message;
    private Integer streak;
}
