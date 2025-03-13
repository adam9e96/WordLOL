package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.entity.UserStudyProgress;
import com.adam9e96.wordlol.repository.jpa.UserStudyProgressRepository;
import com.adam9e96.wordlol.service.interfaces.StudyProgressService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class StudyProgressServiceImpl implements StudyProgressService {
    private final UserStudyProgressRepository progressRepository;

    @Override
    public int incrementPerfectRun(String sessionId) {
        UserStudyProgress progress = progressRepository.findBySessionId(sessionId)
                .orElse(new UserStudyProgress(null, sessionId, 0, LocalDateTime.now()));

        progress.update(sessionId, progress.getPerfectRun() + 1, LocalDateTime.now());
        progressRepository.save(progress);
        return progress.getPerfectRun();
    }

    @Override
    public void resetPerfectRun(String sessionId) {
        UserStudyProgress progress = progressRepository.findBySessionId(sessionId)
                .orElse(new UserStudyProgress(null, sessionId, 0, LocalDateTime.now()));

        progress.update(sessionId, 0, LocalDateTime.now());
        progressRepository.save(progress);
    }

    @Override
    public int getCurrentPerfectRun(String sessionId) {
        return progressRepository.findBySessionId(sessionId)
                .map(UserStudyProgress::getPerfectRun)
                .orElse(0);
    }
}
