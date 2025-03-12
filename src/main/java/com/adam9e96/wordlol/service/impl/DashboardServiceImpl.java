package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.dto.DashBoardResponse;
import com.adam9e96.wordlol.domain.word.entity.Word;
import com.adam9e96.wordlol.domain.word.mapper.WordMapper;
import com.adam9e96.wordlol.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final WordMapper wordMapper;

    public DashBoardResponse getDashboardData() {
        // 전체 단어 수 조회
        int totalWords = wordMapper.countAll();

        // 최근에 추가된 단어 5개 조회
        List<Word> recent5Words = wordMapper.findRecent5Words();


        // TODO : 추구 구현할 기능
        int todayStudiedWords = 0; // 학습 이력 테이블 구현 후 개발 구현
        int currentStreak = 0; // g현재 perfectRun 값 가져오기
        double correctRate = 0.0; // 정답률 계산 로직 구현 필요

        return new DashBoardResponse(
                totalWords,
                todayStudiedWords,
                currentStreak,
                correctRate,
                recent5Words
        );
    }
}
