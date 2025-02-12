package com.adam9e96.wordlol.service;

import com.adam9e96.wordlol.entity.UserStudyProgress;
import com.adam9e96.wordlol.repository.UserStudyProgressRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class StudyProgressService {
    private final UserStudyProgressRepository progressRepository;

    public int incrementPerfectRun(Long userId) {
        UserStudyProgress progress = progressRepository.findByUserId(userId)
                .orElse(new UserStudyProgress(null, userId, 0, LocalDateTime.now()));

        progress.update(userId, progress.getPerfectRun() + 1, LocalDateTime.now());

        progressRepository.save(progress);
        return progress.getPerfectRun();
    }

    public void resetPerfectRun(Long userId) {
        UserStudyProgress progress = progressRepository.findByUserId(userId)
                .orElse(new UserStudyProgress(null, userId, 0, LocalDateTime.now()));

        progress.update(userId, 0, LocalDateTime.now());
        progressRepository.save(progress);
    }
}
