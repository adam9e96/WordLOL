package com.adam9e96.wordlol.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "word_book")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordBook {
    @OneToMany(mappedBy = "wordBook", cascade = CascadeType.ALL)
    private List<EnglishWord> words = new ArrayList<>(); // 초기화 추가
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WordBook createNewWordBook(String name, String description, Category category) {
        WordBook wordBook = new WordBook();
        wordBook.name = name;
        wordBook.description = description;
        wordBook.category = category;
        wordBook.createdAt = LocalDateTime.now();
        wordBook.updatedAt = LocalDateTime.now();
        wordBook.words = new ArrayList<>();
        return wordBook;
    }

    public void addWord(EnglishWord word) {
        if (this.words == null) {
            this.words = new ArrayList<>();
        }
        this.words.add(word);
        word.setWordBook(this);
    }

    public void updateInfo(String name, String description, Category category) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.updatedAt = LocalDateTime.now();
    }

}
