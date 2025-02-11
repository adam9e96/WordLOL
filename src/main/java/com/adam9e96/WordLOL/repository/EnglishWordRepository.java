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

    List<EnglishWord> findByWordBookCategory(Category category);

    List<EnglishWord> findByWordBookId(Long wordBookId);

}
