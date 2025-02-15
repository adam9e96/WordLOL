package com.adam9e96.wordlol.mapper;

import com.adam9e96.wordlol.entity.Category;
import com.adam9e96.wordlol.entity.WordBook;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface WordBookMapper {

    List<WordBook> findByCategory(Category category);
}
