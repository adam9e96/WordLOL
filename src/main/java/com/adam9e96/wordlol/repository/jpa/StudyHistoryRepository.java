package com.adam9e96.wordlol.repository.jpa;

import com.adam9e96.wordlol.entity.StudyHistory;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudyHistoryRepository extends JpaRepository<StudyHistory, Long> {
    // 특정 사용자의 최근 학습 기록 조회
    List<StudyHistory> findByUserOrderByStudyTimeDesc(User user);

    // 최근 N개의 학습 기록 조회
    List<StudyHistory> findTop30ByUserOrderByStudyTimeDesc(User user);

    // 특정 사용자가 특정 단어를 학습한 기록 조회
    List<StudyHistory> findByUserAndWordOrderByStudyTimeDesc(User user, Word word);

    // 특정 기간 동안의 학습 기록 조회
    List<StudyHistory> findByUserAndStudyTimeBetween(User user, LocalDateTime start, LocalDateTime end);

    // 특정 사용자의 오늘 학습한 단어 수 계산
    @Query("SELECT COUNT(DISTINCT sh.word.id) FROM StudyHistory sh WHERE sh.user.id = :userId AND DATE(sh.studyTime) = CURRENT_DATE")
    int countTodayStudiedWords(Long userId);

    // 특정 사용자의 정답률 계산
    @Query("SELECT COUNT(sh) FROM StudyHistory sh WHERE sh.user.id = :userId AND sh.isCorrect = true")
    long countCorrectAnswers(Long userId);

    @Query("SELECT COUNT(sh) FROM StudyHistory sh WHERE sh.user.id = :userId")
    long countTotalAnswers(Long userId);

    // 최근 N일간 학습한 단어 ID 목록 조회
    @Query("SELECT sh.word.id FROM StudyHistory sh WHERE sh.user.id = :userId AND sh.studyTime > :since ORDER BY sh.studyTime DESC")
    List<Long> findRecentlyStudiedWordIds(Long userId, LocalDateTime since);
}