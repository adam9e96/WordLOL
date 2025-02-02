package com.adam9e96.WordLOL.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "word_book")
@Getter
public class WordBook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // 예 "토익 A Day1"

    @Column(nullable = false)
    private String description; // 예 "토익 1일차 단어"

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Category category; // 예 "토익", "토플", "수능", "토익스피킹"

    @OneToMany(mappedBy = "wordBook")
    private List<EnglishWord> words = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
