package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.WordDto;
import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EnglishWordService {
    @Autowired
    private EnglishWordRepository englishWordRepository;

    public WordDto findVocabularyById(Long id) {

        EnglishWord englishWord = englishWordRepository.findById(id).get();

        return new WordDto(englishWord.getId(),
                englishWord.getVocabulary(),
                englishWord.getMeaning(),
                englishWord.getHint());
    }

    void insertWord(String vocabulary, String meaning) {

    }

}
