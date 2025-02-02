package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.repository.WordBookRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class WordBookService {
    private final WordBookRepository wordBookRepository;
    private final EnglishWordService englishWordService;

}
