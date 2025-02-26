package com.adam9e96.wordlol.service.interfaces;

import com.adam9e96.wordlol.dto.WordRequest;
import com.adam9e96.wordlol.dto.WordSearchRequest;
import com.adam9e96.wordlol.entity.Word;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WordService {
    // 기본 CRUD 작업
    void createWord(WordRequest request);

    int createWords(List<WordRequest> requests);

    Word findById(Long id);

    void updateWord(Long id, WordRequest request);

    void deleteWord(Long id);

    Page<Word> findAllWithPaging(Pageable pageable);

    // 학습 관련 작업
    Word findRandomWord();

    Boolean validateAnswer(Long id, String userAnswer);

    List<Word> findRandomWords();

    boolean checkVocabularyDuplicate(String vocabulary, Long excludeId);

    Page<Word> searchWords(WordSearchRequest request, Pageable pageable);
}
