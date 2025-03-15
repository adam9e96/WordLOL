package com.adam9e96.wordlol.entity;

import com.adam9e96.wordlol.enums.Category;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "wordBook", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Word> words = new ArrayList<>(); // 초기화 추가

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public static WordBook createWordBook(String name, String description, Category category) {
        return WordBook.builder()
                .name(name)
                .description(description)
                .category(category)
                .build();
    }

    public void addWord(Word word) {
        this.words.add(word);
        word.setWordBook(this);
    }

    public void update(String name, String description, Category category) {
        this.name = name;
        this.description = description;
        this.category = category;
    }

}
