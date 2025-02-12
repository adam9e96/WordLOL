package com.adam9e96.wordlol.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserStudyProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // 사용자 식별자
    private int perfectRun; // 연속 정답 수
    private LocalDateTime lastStudyDate; // 마지막 학습 날짜

    // 생성자, 게터, 세터
    public void update(Long userId, int perfectRun, LocalDateTime lastStudyDate) {
        this.userId = userId;
        this.perfectRun = perfectRun;
        this.lastStudyDate = lastStudyDate;
    }
}

