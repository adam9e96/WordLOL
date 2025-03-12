package com.adam9e96.wordlol.controller.impl;

import com.adam9e96.wordlol.controller.interfaces.WordBookRestController;
import com.adam9e96.wordlol.domain.word.dto.WordResponse;
import com.adam9e96.wordlol.dto.*;
import com.adam9e96.wordlol.entity.Category;
import com.adam9e96.wordlol.service.interfaces.WordBookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/wordbooks")
@RequiredArgsConstructor
public class WordBookRestControllerImpl implements WordBookRestController {
    private final WordBookService wordBookService;

    @Override
    @PostMapping
    public ResponseEntity<WordBookResponse> createWordBook(@RequestBody WordBookRequest request) {
        WordBookResponse response = wordBookService.createWordBook(request);
        return ResponseEntity.ok().body(response);
    }

    @Override
    @GetMapping("{id}/words")
    public ResponseEntity<List<WordResponse>> getWordBookWords(@PathVariable("id") Long id) {
        List<WordResponse> responses = wordBookService.findWordsByWordBookId(id);
        return ResponseEntity.ok().body(responses);
    }

    // 아직 안씀
    @Override
    @GetMapping("/category/{category}/words")
    public ResponseEntity<List<WordResponse>> getWordsByCategoryName(@PathVariable("category") Category category) {
        return ResponseEntity.ok().body(
                wordBookService.findWordsByBookCategory(category));
    }

    // 단어장 목록 조회용 (리스트 페이지에서 사용)
    // createAt, updatedAt은 추구 필터링 기능을 위해 넘겨줌
    @Override
    @GetMapping
    public ResponseEntity<List<WordBookListResponse>> getWordBooks() {
        List<WordBookListResponse> response = wordBookService.findAllWordBookList();
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/category")
    public ResponseEntity<List<WordBookResponse>> getWordBooksByCategory(@RequestParam("category") Category category) {
        List<WordBookResponse> response = wordBookService.findWordBookListByCategory(category);
        return ResponseEntity.ok().body(response);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWordBook(@PathVariable("id") Long id) {
        wordBookService.deleteWordBookById(id);
        return ResponseEntity.ok().build();
    }

    /**
     * @param id 단어장 ID
     * @since 2025-02-15
     * 단어장 상세 조회용 (수정 페이지에서 사용)
     */
    @Override
    @GetMapping("/{id}")
    public ResponseEntity<WordBookDetailResponse> getWordBook(@PathVariable("id") Long id) {
        WordBookDetailResponse response = wordBookService.findWordBookById(id);
        return ResponseEntity.ok().body(response);
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<WordBookResponse> updateWordBook(
            @PathVariable("id") Long id,
            @Valid @RequestBody WordBookRequest request) {
        WordBookResponse response = wordBookService.updateWordBookById(id, request);
        return ResponseEntity.ok().body(response);
    }

    @Override
    @GetMapping("/{id}/study")
    public ResponseEntity<List<WordBookStudyResponse>> getWordBookStudyData(
            @PathVariable("id") Long id) {
        List<WordBookStudyResponse> response = wordBookService.findWordBookStudyData(id);
        return ResponseEntity.ok(response);
    }

}
