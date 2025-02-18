package com.adam9e96.wordlol.service.interfaces;

import com.adam9e96.wordlol.dto.WordRequest;
import com.adam9e96.wordlol.entity.Word;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WordService {
    // 기본 CRUD 작업
    void createWord(WordRequest request);

    int createWords(List<WordRequest> requests);

    Word findById(Long id);

    void updateWord(Long id, String vocabulary, String meaning, String hint, Integer difficulty);

    void deleteWord(Long id);

    Page<Word> findAllWithPaging(Pageable pageable);

    // 학습 관련 작업
    Word findRandomWord();

    Boolean validateAnswer(Long id, String userAnswer);

    List<Word> findRandomWords();

//    WordResponse getWord(Long id);
//
//    Page<WordResponse> getWords(Pageable pageable);
//
//    List<WordResponse> getWords();
//
//    List<WordResponse> getWordsByDifficulty(Integer difficulty);
//
//    List<WordResponse> getWordsByRandom(Integer count);
//
//    List<WordResponse> getWordsByVocabulary(String vocabulary);
//
//    List<WordResponse> getWordsByMeaning(String meaning);
//
//    List<WordResponse> getWordsByHint(String hint);
//
//    List<WordResponse> getWordsByVocabularyContaining(String vocabulary);
//
//    List<WordResponse> getWordsByMeaningContaining(String meaning);
//
//    List<WordResponse> getWordsByHintContaining(String hint);
}
