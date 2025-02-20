package com.adam9e96.wordlol.repository;

import com.adam9e96.wordlol.entity.UserStudyProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserStudyProgressRepository extends JpaRepository<UserStudyProgress, Long> {
    Optional<UserStudyProgress> findBySessionId(String sessionId);
}
