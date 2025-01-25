package com.adam9e96.WordLOL.repository;

import com.adam9e96.WordLOL.entity.EnglishWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnglishWordRepository extends JpaRepository<EnglishWord, Long> {

}
