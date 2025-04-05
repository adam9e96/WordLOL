package com.adam9e96.wordlol.repository.mybatis;

import com.adam9e96.wordlol.entity.WordBook;
import com.adam9e96.wordlol.enums.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface WordBookMapper {

//    void save(WordBook wordBook);

    Long existById(Long id);

    Optional<WordBook> findById(Long id);

    List<WordBook> findByCategory(@Param("category") Category category, @Param("userId") Long userId);


}
