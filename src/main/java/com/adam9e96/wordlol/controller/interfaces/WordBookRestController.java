package com.adam9e96.wordlol.controller.interfaces;


import com.adam9e96.wordlol.dto.*;
import com.adam9e96.wordlol.entity.Category;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public interface WordBookRestController {
    @PostMapping
    ResponseEntity<WordBookResponse> createWordBook(@RequestBody WordBookRequest request);

    @GetMapping("/{id}/words")
    ResponseEntity<List<WordResponse>> getWordBookWords(@PathVariable("id") Long id);

    @GetMapping("/category/{category}/words")
    ResponseEntity<List<WordResponse>> getWordsByCategoryName(@PathVariable("category") Category category);

    @GetMapping
    ResponseEntity<List<WordBookListResponse>> getWordBooks();

    @GetMapping("/category")
    ResponseEntity<List<WordBookResponse>> getWordBooksByCategory(@RequestParam("category") Category category);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWordBook(@PathVariable("id") Long id);

    @GetMapping("/{id}")
    ResponseEntity<WordBookDetailResponse> getWordBook(@PathVariable("id") Long id);

    @PutMapping("/{id}")
    ResponseEntity<WordBookResponse> updateWordBook(@PathVariable("id") Long id, @RequestBody WordBookRequest request);

    @GetMapping("/{id}/study")
    ResponseEntity<List<WordBookStudyResponse>> getWordBookStudyData(@PathVariable("id") Long id);
}