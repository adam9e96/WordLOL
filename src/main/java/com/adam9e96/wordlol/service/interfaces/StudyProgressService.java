package com.adam9e96.wordlol.service.interfaces;

public interface StudyProgressService {

    int incrementPerfectRun(String sessionId);

    void resetPerfectRun(String sessionId);

    int getCurrentPerfectRun(String sessionId);

}
