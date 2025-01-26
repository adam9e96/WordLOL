package com.adam9e96.WordLOL.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EnglishWordServiceTest {

    @Autowired
    private EnglishWordService englishWordService;

    @Test
    public void insertWord() {
        String vocabulary = "apple";
        String meaning = "사과";
        String hint = "red";
        englishWordService.insertWord(vocabulary, meaning, hint);


    }
}