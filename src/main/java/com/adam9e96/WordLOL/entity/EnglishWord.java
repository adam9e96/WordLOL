package com.adam9e96.WordLOL.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

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

    @Column(name = "difficulty", nullable = false)
    private Integer difficulty;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_book_id")
    private WordBook wordBook;

    @Builder
    public EnglishWord(Long id, String vocabulary, String meaning, String hint, Integer difficulty, WordBook wordBook) {
        this.id = id;
        this.vocabulary = vocabulary;
        this.meaning = meaning;
        this.hint = hint;
        this.difficulty = difficulty;
        this.wordBook = wordBook;
    }

    public EnglishWord() {
        this.difficulty = 1;

    }

    public void update(String vocabulary, String meaning, String hint, Integer difficulty) {
        this.vocabulary = vocabulary;
        this.meaning = meaning;
        this.hint = hint;
        this.difficulty = difficulty != null ? difficulty : this.difficulty; // difficulty가 null이면 기존 값을 유지합니다.
    }

}
