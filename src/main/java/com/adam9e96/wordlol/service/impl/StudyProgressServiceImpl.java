package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.entity.UserStudyProgress;
import com.adam9e96.wordlol.repository.UserStudyProgressRepository;
import com.adam9e96.wordlol.service.interfaces.StudyProgressService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class StudyProgressServiceImpl implements StudyProgressService {
    private final UserStudyProgressRepository progressRepository;

    @Override
    public int incrementPerfectRun(Long userId) {
        UserStudyProgress progress = progressRepository.findByUserId(userId)
                .orElse(new UserStudyProgress(null, userId, 0, LocalDateTime.now()));

        progress.update(userId, progress.getPerfectRun() + 1, LocalDateTime.now());

        progressRepository.save(progress);
        return progress.getPerfectRun();
    }

    @Override
    public void resetPerfectRun(Long userId) {
        UserStudyProgress progress = progressRepository.findByUserId(userId)
                .orElse(new UserStudyProgress(null, userId, 0, LocalDateTime.now()));

        progress.update(userId, 0, LocalDateTime.now());
        progressRepository.save(progress);
    }
}
