package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.WordBookRequest;
import com.adam9e96.WordLOL.dto.WordBookResponse;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.Category;
import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.entity.WordBook;
import com.adam9e96.WordLOL.service.EnglishWordService;
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
    private final EnglishWordService englishWordService;


    @PostMapping("/create")
    public ResponseEntity<WordBookResponse> createWordBook(@RequestBody WordBookRequest request) {
        WordBook wordBook = wordBookService.createWordBook(request);
        return ResponseEntity.ok().body(toResponse(wordBook));
    }

    @GetMapping("/{id}/words")
    public ResponseEntity<List<WordResponse>> getWordsInWordBook(@PathVariable int id) {
        log.info("getWordsInWordBook 실행됨");
        return ResponseEntity.ok().body(wordBookService.getWordsByWordBookId(id)
                .stream()
                .map(this::toWordResponse)
                .toList());
    }

    @GetMapping("/category/{category}/words")
    public ResponseEntity<List<WordResponse>> getWordsByCategory(@PathVariable Category category) {
        return ResponseEntity.ok().body(
                wordBookService.getWordsByCategory(category).stream()
                        .map(this::toWordResponse)
                        .toList());
    }

    @GetMapping
    public ResponseEntity<List<WordBookResponse>> getAllWordBooks() {
        return ResponseEntity.ok()
                .body(wordBookService.findAllWordBooks().stream()
                        .map(this::toResponse)
                        .toList());
    }

    @GetMapping("/category")
    public ResponseEntity<List<WordBookResponse>> getWordBooksByCategory(@RequestParam Category category) {
        log.info("category 선택 : {},{}", category, category.getDescription());
        return ResponseEntity.ok().body(
                wordBookService.findWordBooksByCategory(category)
                        .stream()
                        .map(this::toResponse)
                        .toList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        try {
            wordBookService.deleteWordBook(Long.parseLong(String.valueOf(id)));
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<WordBookResponse> getWordBook(@PathVariable Long id) {
        return wordBookService.findById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<WordBookResponse> updateWordBook(@PathVariable Long id, @RequestBody WordBookRequest request) {
        try {
            WordBook updatedWordBook = wordBookService.updateWordBook(id, request);
            return ResponseEntity.ok().body(toResponse(updatedWordBook));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private WordBookResponse toResponse(WordBook wordBook) {
        return new WordBookResponse(
                wordBook.getId(),
                wordBook.getName(),
                wordBook.getDescription(),
                wordBook.getCategory(),
                wordBook.getWords().size(),  // 단어 수
                wordBook.getCreatedAt()
        );
    }

    private WordResponse toWordResponse(EnglishWord word) {
        return new WordResponse(
                word.getId(),
                word.getVocabulary(),
                word.getMeaning(),
                word.getHint(),
                word.getDifficulty(),
                word.getCreatedAt(),
                word.getUpdatedAt()
        );
    }

    public ResponseEntity<List<WordResponse>> getWordBookResponse(@PathVariable long id) {
        return ResponseEntity.ok().body(
                englishWordService.findWordsByBookId(id)
                        .stream()
                        .map(this::toWordResponse)
                        .toList()
        );
    }

}
