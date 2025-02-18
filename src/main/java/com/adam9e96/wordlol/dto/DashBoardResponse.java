package com.adam9e96.wordlol.dto;

import com.adam9e96.wordlol.entity.Word;

import java.util.List;

public record DashBoardResponse(
        int totalWords, // 전체 단어 수
        int todayStudiedWords, // 오늘 하급한 단어 수
        int currentStreak, // 현재 연속 정답 수
        double correctRate, // 정답률
        List<Word> recentWords // 최근 추가된 단어들
) {
}
