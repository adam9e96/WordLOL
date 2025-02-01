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


    /*
      @return WordResponse
     * @deprecated  : Use WordMapper.findRandom5Words() 로 대체됨
     */
//    @Query("SELECT new com.adam9e96.WordLOL.dto.WordResponse(e.id, e.vocabulary, e.meaning, null, e.difficulty, null, null) " +
//            "FROM EnglishWord e ORDER BY RAND() LIMIT 5")
//    List<WordResponse> findRandom5Words();
}
