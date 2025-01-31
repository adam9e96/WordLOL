package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.DashBoardResponse;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EnglishWordService englishWordService;
    private final EnglishWordRepository englishWordRepository;

    public DashBoardResponse getDashboardData() {
        // 전체 단어 수 조회
        int totalWords = englishWordService.countAllWordList();

        // 최근에 추가된 단어 5개 조회
        List<WordResponse> recentWords = englishWordRepository.findRecentFiveWords()
                .stream()
                .map(word -> new WordResponse(
                        word.getId(),
                        word.getVocabulary(),
                        word.getMeaning(),
                        word.getHint(),
                        word.getDifficulty(),
                        word.getCreatedAt(),
                        word.getUpdatedAt()
                ))
                .toList();


        // TODO : 추구 구현할 기능
        int todayStudiedWords = 0; // 학습 이력 테이블 구현 후 개발 구현
        int currentStreak = 0; // g현재 streak 값 가져오기
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
