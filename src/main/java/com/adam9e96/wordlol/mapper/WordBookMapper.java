package com.adam9e96.wordlol.mapper;

import com.adam9e96.wordlol.entity.Category;
import com.adam9e96.wordlol.entity.WordBook;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface WordBookMapper {

//    void save(WordBook wordBook);

    Long existById(Long id);

    Optional<WordBook> findById(Long id);

    List<WordBook> findByCategory(Category category);
}
