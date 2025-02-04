package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.WordBookRequest;
import com.adam9e96.WordLOL.dto.WordBookResponse;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.Category;
import com.adam9e96.WordLOL.service.WordBookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/wordbooks")
@RequiredArgsConstructor
public class WordBookRestController {
    private final WordBookService wordBookService;

    @PostMapping
    public ResponseEntity<WordBookResponse> createWordBook(@RequestBody WordBookRequest request) {
        return ResponseEntity.ok(wordBookService.createWordBook(request));
    }

//    @GetMapping("/{id}/words")
//    public ResponseEntity<Page<WordResponse>> getWordsInBook(
//            @PathVariable Long id,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "20") int size) {
//        return ResponseEntity.ok(wordBookService.getWordsInBook(id,
//                PageRequest.of(page, size)));
//    }

    @GetMapping("/{id}/words")
    public ResponseEntity<List<WordResponse>> getWordsInWordBook(@PathVariable int id) {
        log.info("getWordsInWordBook 실행됨");
        return ResponseEntity.ok(wordBookService.getWordsByWordBookId(id));
    }

    @GetMapping("/category/{category}/words")
    public ResponseEntity<List<WordResponse>> getWordsByCategory(@PathVariable Category category) {
        return ResponseEntity.ok(wordBookService.getWordsByCategory(category));
    }

    @GetMapping
    public ResponseEntity<List<WordBookResponse>> getAllWordBooks() {
        return ResponseEntity.ok(wordBookService.findAllWordBooks());
    }

    @GetMapping("/category")
    public ResponseEntity<List<WordBookResponse>> getWordBooksByCategory(
            @RequestParam Category category) {
        return ResponseEntity.ok(wordBookService.findWordBooksByCategory(category));
    }
}
