package com.adam9e96.WordLOL.repository;

import com.adam9e96.WordLOL.entity.Category;
import com.adam9e96.WordLOL.entity.WordBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WordBookRepository extends JpaRepository<WordBook, Long> {
    Optional<WordBook> findByName(String name);

    List<WordBook> findByCategory(Category category);
}
