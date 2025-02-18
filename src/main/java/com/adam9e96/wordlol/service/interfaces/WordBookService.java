package com.adam9e96.wordlol.service.interfaces;

import com.adam9e96.wordlol.dto.WordBookRequest;
import com.adam9e96.wordlol.entity.Category;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.entity.WordBook;

import java.util.List;

public interface WordBookService {
    WordBook createWordBook(WordBookRequest request);

    List<Word> findWordsInWordBook(Long wordBookId);

    List<WordBook> findWordBookListByCategory(Category category);

    List<WordBook> findAllWordBookList();

    List<Word> findWordsByBookCategory(Category category);

    List<Word> findWordBookStudyData(Long wordBookId);

    WordBook findWordBookById(Long id);

    WordBook updateWordBookById(Long id, WordBookRequest request);

    void deleteWordBookById(Long id);
}
