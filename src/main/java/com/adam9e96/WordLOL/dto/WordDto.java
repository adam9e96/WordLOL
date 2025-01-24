package com.adam9e96.WordLOL.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WordDto {
    private Long id;
    private String english;
    private String korean;
    private String hint;
}

