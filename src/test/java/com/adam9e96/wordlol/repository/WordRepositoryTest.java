package com.adam9e96.wordlol.repository;

import com.adam9e96.wordlol.domain.word.repository.WordRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class WordRepositoryTest {

    @Autowired
    private WordRepository wordRepository;

    @Test
    public void findVocabularyById() {
        String ee = wordRepository.findById(1L).get().getVocabulary();
        assertEquals("abandon", ee);
    }

}