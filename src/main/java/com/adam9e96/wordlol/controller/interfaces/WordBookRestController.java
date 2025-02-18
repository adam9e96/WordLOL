package com.adam9e96.wordlol.controller.interfaces;


import com.adam9e96.wordlol.dto.*;
import com.adam9e96.wordlol.entity.Category;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public interface WordBookRestController {
    @PostMapping("/create")
    ResponseEntity<WordBookResponse> createWordBook(@RequestBody WordBookRequest request);

    @GetMapping("/words/{wordBookId}")
    ResponseEntity<List<WordResponse>> getWordsInWordBook(@PathVariable("wordBookId") Long wordBookId);

    @GetMapping("/category/{category}/words")
    ResponseEntity<List<WordResponse>> getWordsByBookCategory(@PathVariable("category") Category category);

    @GetMapping
    ResponseEntity<List<WordBookListResponse>> getWordBookList();

    @GetMapping("/category")
    ResponseEntity<List<WordBookResponse>> getWordBookListByCategory(@RequestParam("category") Category category);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWordBookById(@PathVariable("id") Long id);

    @GetMapping("/{id}")
    ResponseEntity<WordBookDetailResponse> getWordBookDetailById(@PathVariable("id") Long id);

    @PutMapping("/{id}")
    ResponseEntity<WordBookResponse> updateWordBookById(@PathVariable("id") Long id, @RequestBody WordBookRequest request);

    @GetMapping("/study/{wordBookId}")
    ResponseEntity<List<WordBookStudyResponse>> getWordBookStudyData(@PathVariable("wordBookId") Long wordBookId);
}