package com.adam9e96.WordLOL.repository;

import com.adam9e96.WordLOL.entity.Category;
import com.adam9e96.WordLOL.entity.EnglishWord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface EnglishWordRepository extends JpaRepository<EnglishWord, Long> {

    Page<EnglishWord> findByWordBookId(Long wordBookId, Pageable pageable);

    // 특정 단어장의 모든 단어 조회
//    List<EnglishWord> findByWordBookId(Long wordBookId);

    List<EnglishWord> findByWordBook_Category(Category category);


    // 특정 단어장에서 랜덤 단어 조회
//    @Query(value = "SELECT * FROM english_word WHERE word_book_id = :wordBookId ORDER BY RAND() LIMIT 1", nativeQuery = true)
//    Optional<EnglishWord> findRandomWordByWordBookId(@Param("wordBookId") Long wordBookId);

}
