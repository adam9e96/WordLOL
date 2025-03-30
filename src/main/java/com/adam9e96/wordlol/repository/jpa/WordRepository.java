package com.adam9e96.wordlol.repository.jpa;

import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.enums.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByWordBookCategory(Category category);

    boolean existsByVocabularyIgnoreCase(String vocabulary);

    boolean existsByVocabularyIgnoreCaseAndIdNot(String vocabulary, Long excludeId);

    List<Word> findByUser(User user);

    Page<Word> findByUser(User user, Pageable pageable);
}
