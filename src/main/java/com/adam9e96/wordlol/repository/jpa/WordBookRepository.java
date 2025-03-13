package com.adam9e96.wordlol.repository.jpa;

import com.adam9e96.wordlol.entity.WordBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WordBookRepository extends JpaRepository<WordBook, Long> {

}
