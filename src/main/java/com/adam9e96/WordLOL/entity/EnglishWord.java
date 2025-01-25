package com.adam9e96.WordLOL.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

@Entity
@Table(name = "english_word")
@Getter
public class EnglishWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vocabulary", nullable = false, length = 100)
    private String vocabulary; // 단어

    @Column(name = "meaning", nullable = false, length = 100)
    private String meaning; // 뜻

    @Column(name = "hint", nullable = true, length = 100)
    private String hint; // 힌트


    @Builder
    public EnglishWord(Long id, String vocabulary, String meaning) {
        this.id = id;
        this.vocabulary = vocabulary;
        this.meaning = meaning;
    }

    public EnglishWord() {

    }
}
