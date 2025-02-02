package com.adam9e96.WordLOL.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "word_book")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
public class WordBook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Category category;

    @OneToMany(mappedBy = "wordBook", cascade = CascadeType.ALL)
    private List<EnglishWord> words = new ArrayList<>(); // 초기화 추가

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // 단어 추가를 위한 메서드
    public void addWord(EnglishWord word) {
        words.add(word);
        word.setWordBook(this);
    }

}
