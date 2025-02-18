package com.adam9e96.wordlol.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "word")
@Getter
@NoArgsConstructor
public class Word {

    /**
     * 영어 단어의 고유 식별자입니다.
     * Identity 전략을 통해 데이터베이스에서 자동으로 생성됩니다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 영어 단어(어휘)입니다.
     * null을 허용하지 않으며 최대 100자의 길이를 가집니다.
     */
    @Column(name = "vocabulary", nullable = false, length = 100)
    private String vocabulary; // 단어


    /**
     * 단어의 의미 또는 정의입니다.
     * null을 허용하지 않으며 최대 100자의 길이를 가집니다.
     */
    @Column(name = "meaning", nullable = false, length = 100)
    private String meaning; // 뜻

    /**
     * 단어에 대한 선택적 힌트 또는 추가 설명입니다.
     * null이 허용되며 최대 100자의 길이를 가집니다.
     */
    @Column(name = "hint", length = 100)
    private String hint; // 힌트

    /**
     * 단어의 난이도입니다.
     * null을 허용하지 않으며, 기본값은 1로 설정되어 있습니다.
     */
    @Column(name = "difficulty", nullable = false)
    private Integer difficulty = 1;

    /**
     * 엔티티가 생성된 시점을 나타내는 타임스탬프입니다.
     * 엔티티 삽입 시 자동으로 설정되며, 이후에는 수정되지 않습니다.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 엔티티가 마지막으로 수정된 시점을 나타내는 타임스탬프입니다.
     * 엔티티 업데이트 시 자동으로 갱신됩니다.
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false, updatable = true)
    private LocalDateTime updatedAt;

    /**
     * 해당 영어 단어가 속하는 단어장(WordBook)과의 다대일 관계를 설정합니다.
     * 외래키는 "word_book_id" 컬럼으로 매핑되며, 지연 로딩(Lazy Loading) 방식으로 동작합니다.
     */
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_book_id")
    private WordBook wordBook;

    /**
     * 영어 단어 객체를 생성하기 위한 빌더 패턴 생성자입니다.
     *
     * @param id         영어 단어의 고유 식별자
     * @param vocabulary 영어 단어(어휘)
     * @param meaning    단어의 의미 또는 정의
     * @param hint       단어에 대한 선택적 힌트
     * @param difficulty 단어의 난이도
     * @param wordBook   해당 단어가 속하는 단어장(WordBook)
     */
    @Builder
    public Word(Long id, String vocabulary, String meaning, String hint, Integer difficulty, WordBook wordBook) {
        this.id = id;
        this.vocabulary = vocabulary;
        this.meaning = meaning;
        this.hint = hint;
        this.difficulty = difficulty;
        this.wordBook = wordBook;
    }


    /**
     * 영어 단어의 세부 정보를 업데이트합니다.
     * 만약 전달된 난이도 값이 null 이면, 기존의 난이도 값을 유지합니다.
     *
     * @param vocabulary 새로운 영어 단어(어휘)
     * @param meaning    새로운 단어의 의미 또는 정의
     * @param hint       새로운 선택적 힌트
     * @param difficulty 새로운 난이도 (null 인 경우 기존 값 유지)
     */
    public void update(String vocabulary, String meaning, String hint, Integer difficulty) {
        this.vocabulary = vocabulary;
        this.meaning = meaning;
        this.hint = hint;
        this.difficulty = difficulty != null ? difficulty : this.difficulty;
    }

}
