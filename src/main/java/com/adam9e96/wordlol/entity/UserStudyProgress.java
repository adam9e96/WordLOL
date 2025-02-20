package com.adam9e96.wordlol.entity;

import jakarta.persistence.*;
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

    @Column(nullable = false, unique = true)
    private String sessionId; // userId 대신 sessionId 사용
    private int perfectRun;
    private LocalDateTime lastStudyDate;

    public void update(String sessionId, int perfectRun, LocalDateTime lastStudyDate) {
        this.sessionId = sessionId;
        this.perfectRun = perfectRun;
        this.lastStudyDate = lastStudyDate;
    }
}