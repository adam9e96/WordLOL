package com.adam9e96.WordLOL.repository;

import com.adam9e96.WordLOL.entity.EnglishWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface EnglishWordRepository extends JpaRepository<EnglishWord, Long> {

    List<EnglishWord> findTop5ByOrderByIdDesc();

    @Query("SELECT e FROM EnglishWord e ORDER BY e.id DESC LIMIT 5")
    List<EnglishWord> findRecentFiveWords();


    @Query("SELECT e.id FROM EnglishWord e")
    List<Long> findAllIds();

    @Query("SELECT COUNT(e) FROM EnglishWord e")
    long countAllWords();
}
