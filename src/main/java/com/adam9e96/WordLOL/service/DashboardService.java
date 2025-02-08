package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.DashBoardResponse;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.mapper.WordMapper;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EnglishWordService englishWordService;
    private final EnglishWordRepository englishWordRepository;
    private final WordMapper wordMapper;

    public DashBoardResponse getDashboardData() {
        // 전체 단어 수 조회
        int totalWords = englishWordService.countAll();

        // 최근에 추가된 단어 5개 조회
        List<WordResponse> recentWords = wordMapper.findRecent5Words();



        // TODO : 추구 구현할 기능
        int todayStudiedWords = 0; // 학습 이력 테이블 구현 후 개발 구현
        int currentStreak = 0; // g현재 perfectRun 값 가져오기
        double correctRate = 0.0; // 정답률 계산 로직 구현 필요

        return new DashBoardResponse(
                totalWords,
                todayStudiedWords,
                currentStreak,
                correctRate,
                recentWords
        );
    }
}
