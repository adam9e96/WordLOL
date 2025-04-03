package com.adam9e96.wordlol.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 요구사항
public class StudyHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @CreationTimestamp
    @Column(name = "study_time", nullable = false, updatable = false)
    private LocalDateTime studyTime;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "response_time_ms")
    private Long responseTimeMs;

    // 생성자 기반 초기화
    public StudyHistory(User user, Word word, Boolean isCorrect, Long responseTimeMs) {
        this.user = user;
        this.word = word;
        this.isCorrect = isCorrect;
        this.responseTimeMs = responseTimeMs;
    }

    // 정적 팩토리 메서드 (응답 시간 없는 버전)
    public static StudyHistory createStudyRecord(User user, Word word, Boolean isCorrect) {
        return new StudyHistory(user, word, isCorrect, null);
    }

    // 정적 팩토리 메서드 (응답 시간 포함 버전)
    public static StudyHistory createStudyRecordWithResponseTime(User user, Word word, Boolean isCorrect, Long responseTimeMs) {
        return new StudyHistory(user, word, isCorrect, responseTimeMs);
    }
}