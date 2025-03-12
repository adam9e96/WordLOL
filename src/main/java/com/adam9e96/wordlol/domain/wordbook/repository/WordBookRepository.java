package com.adam9e96.wordlol.domain.wordbook.repository;

import com.adam9e96.wordlol.domain.wordbook.entity.WordBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WordBookRepository extends JpaRepository<WordBook, Long> {

}
