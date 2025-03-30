package com.adam9e96.wordlol.repository.jpa;

import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.entity.WordBook;
import com.adam9e96.wordlol.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordBookRepository extends JpaRepository<WordBook, Long> {

    List<WordBook> findByUser(User user);

    List<WordBook> findByUserAndCategory(User user, Category category);
}
