package com.adam9e96.WordLOL.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class WordDto {
    private Long id;
    private String vocabulary;
    private String meaning;
    private String hint;
}

