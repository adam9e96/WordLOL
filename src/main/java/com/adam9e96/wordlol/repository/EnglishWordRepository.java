package com.adam9e96.wordlol.repository;

import com.adam9e96.wordlol.entity.Category;
import com.adam9e96.wordlol.entity.EnglishWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface EnglishWordRepository extends JpaRepository<EnglishWord, Long> {

    List<EnglishWord> findByWordBookCategory(Category category);

}
