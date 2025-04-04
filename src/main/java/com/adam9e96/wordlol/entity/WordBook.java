package com.adam9e96.wordlol.entity;

import com.adam9e96.wordlol.enums.Category;
import jakarta.persistence.*;
import lombok.*;
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

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * WordBook 생성을 위한 정적 팩토리 메서드
     * User 정보 포함
     */
    public static WordBook createWordBook(String name, String description, Category category, User user) {
        return WordBook.builder()
                .name(name)
                .description(description)
                .category(category)
                .user(user)
                .build();
    }

    /**
     * 새로운 Word를 생성하여 단어장에 추가하는 팩토리 메서드
     * 이 방식은 Word 엔티티의 setter 없이 새 Word 인스턴스를 생성하고 관계를 설정
     *
     * @param vocabulary 단어
     * @param meaning 의미
     * @param hint 힌트
     * @param difficulty 난이도
     * @param user 사용자
     * @return 생성된 Word 객체
     */
    public Word createAndAddWord(String vocabulary, String meaning, String hint, Integer difficulty, User user) {
        // 단어장과의 관계가 이미 설정된 새로운 Word 객체 생성
        Word newWord = Word.builder()
                .vocabulary(vocabulary)
                .meaning(meaning)
                .hint(hint)
                .difficulty(difficulty)
                .user(user)
                .wordBook(this) // 생성 시점에 단어장 설정
                .build();

        // 단어장의 words 컬렉션에 추가
        this.words.add(newWord);

        return newWord;
    }

    /**
     * 단어장 정보를 불변적으로 업데이트
     * 새로운 WordBook 객체를 반환하는 대신 현재 객체의 상태 업데이트
     *
     * @param name 새 이름
     * @param description 새 설명
     * @param category 새 카테고리
     */
    public void update(String name, String description, Category category) {
        this.name = name;
        this.description = description;
        this.category = category;
    }

}
