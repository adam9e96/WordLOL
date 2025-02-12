package com.adam9e96.wordlol.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EnglishWordRepositoryTest {

    @Autowired
    private EnglishWordRepository englishWordRepository;

    @Test
    public void findVocabularyById() {
        String ee = englishWordRepository.findById(1L).get().getVocabulary();
        assertEquals("abandon", ee);
    }

}