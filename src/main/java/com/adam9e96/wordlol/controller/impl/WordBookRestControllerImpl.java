package com.adam9e96.wordlol.controller.impl;

import com.adam9e96.wordlol.controller.interfaces.WordBookRestController;
import com.adam9e96.wordlol.dto.*;
import com.adam9e96.wordlol.entity.Category;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.entity.WordBook;
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
        WordBook wordBook = wordBookService.createWordBook(request);
        return ResponseEntity.ok().body(convertToWordBookResponse(wordBook));
    }

    @Override
    @GetMapping("{id}/words")
    public ResponseEntity<List<WordResponse>> getWordBookWords(@PathVariable("id") Long id) {
        List<Word> words = wordBookService.findWordsByWordBookId(id);
        List<WordResponse> response = words.stream()
                .map(this::toWordResponse)
                .toList();
        return ResponseEntity.ok().body(response);
    }

    // 아직 안씀
    @Override
    @GetMapping("/category/{category}/words")
    public ResponseEntity<List<WordResponse>> getWordsByCategoryName(@PathVariable("category") Category category) {
        return ResponseEntity.ok().body(
                wordBookService.findWordsByBookCategory(category).stream()
                        .map(this::toWordResponse)
                        .toList());
    }

    // 단어장 목록 조회용 (리스트 페이지에서 사용)
    // createAt, updatedAt은 추구 필터링 기능을 위해 넘겨줌
    @Override
    @GetMapping
    public ResponseEntity<List<WordBookListResponse>> getWordBooks() {
        log.info("모든 단어장 목록 조회 요청");
        List<WordBook> wordBooks = wordBookService.findAllWordBookList();
        List<WordBookListResponse> response = wordBooks.stream()
                .map(this::convertToWordBookListResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/category")
    public ResponseEntity<List<WordBookResponse>> getWordBooksByCategory(@RequestParam("category") Category category) {
        log.info("카테고리별 단어장 조회 요청 - category: {}", category);
        List<WordBook> wordBooks = wordBookService.findWordBookListByCategory(category);
        List<WordBookResponse> response = wordBooks.stream()
                .map(this::convertToWordBookResponse)
                .toList();
        return ResponseEntity.ok().body(response);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWordBook(@PathVariable("id") Long id) {
        log.info("단어장 삭제 요청 - id: {}", id);
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
        WordBook wordBook = wordBookService.findWordBookById(id);
        return ResponseEntity.ok(convertToWordBookDetailResponse(wordBook));
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<WordBookResponse> updateWordBook(
            @PathVariable("id") Long id,
            @Valid @RequestBody WordBookRequest request) {
        log.info("단어장 수정 요청 - id: {}", id);
        WordBook updatedWordBook = wordBookService.updateWordBookById(id, request);
        return ResponseEntity.ok(convertToWordBookResponse(updatedWordBook));
    }

    @Override
    @GetMapping("/{id}/study")
    public ResponseEntity<List<WordBookStudyResponse>> getWordBookStudyData(
            @PathVariable("id") Long id) {
        log.info("단어장 학습 데이터 조회 요청 - wordBookId: {}", id);
        List<Word> words = wordBookService.findWordBookStudyData(id);
        List<WordBookStudyResponse> response = words.stream()
                .map(this::convertToStudyResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    // 목록용 DTO 변환 (리스트 페이지용)
    private WordBookListResponse convertToWordBookListResponse(WordBook wordBook) {
        return new WordBookListResponse(
                wordBook.getId(),
                wordBook.getName(),
                wordBook.getDescription(),
                wordBook.getCategory(),
                wordBook.getWords().size(),
                wordBook.getCreatedAt(),
                wordBook.getUpdatedAt()
        );
    }

    /**
     * 단어장 상세 정보 응답 DTO 변환
     *
     * @param wordBook 단어장 엔티티
     * @return 단어장 상세 정보 응답 DTO
     * @see WordBookDetailResponse
     */
    private WordBookDetailResponse convertToWordBookDetailResponse(WordBook wordBook) {
        return new WordBookDetailResponse(
                wordBook.getId(),
                wordBook.getName(),
                wordBook.getDescription(),
                wordBook.getCategory(),
                wordBook.getCreatedAt(),
                wordBook.getUpdatedAt()
        );
    }

    private WordBookResponse convertToWordBookResponse(WordBook wordBook) {
        return new WordBookResponse(
                wordBook.getId(),
                wordBook.getName(),
                wordBook.getDescription(),
                wordBook.getCategory(),
                wordBook.getWords().size(),  // 단어 수
                wordBook.getCreatedAt(),
                wordBook.getUpdatedAt()
        );
    }

    private WordResponse toWordResponse(Word word) {
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

    private WordBookStudyResponse convertToStudyResponse(Word word) {
        return new WordBookStudyResponse(
                word.getId(),
                word.getVocabulary(),
                word.getMeaning(),
                word.getHint(),
                word.getDifficulty()
        );
    }
}
