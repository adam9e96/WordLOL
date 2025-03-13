package com.adam9e96.wordlol.repository.jpa;

import com.adam9e96.wordlol.enums.Category;
import com.adam9e96.wordlol.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByWordBookCategory(Category category);

    boolean existsByVocabularyIgnoreCase(String vocabulary);

    boolean existsByVocabularyIgnoreCaseAndIdNot(String vocabulary, Long excludeId);

}
