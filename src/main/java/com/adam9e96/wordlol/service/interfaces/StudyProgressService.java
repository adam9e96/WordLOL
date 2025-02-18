package com.adam9e96.wordlol.service.interfaces;

public interface StudyProgressService {

    int incrementPerfectRun(Long userId);

    void resetPerfectRun(Long userId);
}
