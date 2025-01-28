package com.adam9e96.WordLOL.dto;

import java.util.List;

public record DashBoardResponse(
        int totalWords, // 전체 단어 수
        int todayStudieWords, // 오늘 하급한 단어 수
        int currentStreak, // 현재 연속 정답 수
        double correctRate, // 정답률
        List<WordResponse> recentWords // 최근 추가된 단어들
) {
}
