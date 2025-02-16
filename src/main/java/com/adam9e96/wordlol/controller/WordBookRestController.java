package com.adam9e96.wordlol.controller;

import com.adam9e96.wordlol.dto.*;
import com.adam9e96.wordlol.entity.Category;
import com.adam9e96.wordlol.entity.EnglishWord;
import com.adam9e96.wordlol.entity.WordBook;
import com.adam9e96.wordlol.service.WordBookService;
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


    @PostMapping("/create")
    public ResponseEntity<WordBookResponse> createWordBook(@RequestBody WordBookRequest request) {
        WordBook wordBook = wordBookService.createWordBook(request);
        return ResponseEntity.ok().body(toResponse(wordBook));
    }

    /**
     * 특정 단어장에 포함된 모든 단어를 조회합니다.
     *
     * @param wordBookId 조회할 단어장의 ID
     * @return 단어장에 포함된 모든 단어의 목록을 담은 ResponseEntity
     * - 성공 시: 200 OK와 함께 WordResponse 목록 반환
     * - 단어장이 존재하지 않을 경우: 404 Not Found
     * @throws IllegalArgumentException 유효하지 않은 단어장 ID가 제공된 경우
     * @see WordResponse
     * @see WordBookService#getWordsByWordBookId
     */
    @GetMapping("/words/{wordBookId}")
    public ResponseEntity<List<WordResponse>> getWordsByWordBookId(@PathVariable("wordBookId") Long wordBookId) {
        log.info("단어장 ID {}의 단어 목록 조회", wordBookId);
        return ResponseEntity.ok().body(wordBookService.getWordsByWordBookId(wordBookId)
                .stream()
                .map(this::toWordResponse)
                .toList());
    }


    // 아직 안씀
    @GetMapping("/category/{category}/words")
    public ResponseEntity<List<WordResponse>> getWordsByCategory(@PathVariable("category") Category category) {
        return ResponseEntity.ok().body(
                wordBookService.getWordsByCategory(category).stream()
                        .map(this::toWordResponse)
                        .toList());
    }


    // 단어장 목록 조회용 (리스트 페이지에서 사용)
    // createAt, updatedAt은 추구 필터링 기능을 위해 넘겨줌
    @GetMapping
    public ResponseEntity<List<WordBookListResponse>> getAllWordBooks() {
        return ResponseEntity.ok()
                .body(wordBookService.findAllWordBooks().stream()
                        .map(this::toListResponse)
                        .toList());
    }


    // 목록용 DTO 변환 (리스트 페이지용)
    private WordBookListResponse toListResponse(WordBook wordBook) {
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

    @GetMapping("/category")
    public ResponseEntity<List<WordBookResponse>> getWordBooksByCategory(@RequestParam("category") Category category) {
        log.info("category 선택 : {},{}", category, category.getDescription());
        return ResponseEntity.ok().body(
                wordBookService.findWordBooksByCategory(category)
                        .stream()
                        .map(this::toResponse)
                        .toList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        try {
            wordBookService.deleteWordBook(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * @param id 단어장 ID
     * @since 2025-02-15
     * 단어장 상세 조회용 (수정 페이지에서 사용)
     */
    @GetMapping("/{id}")
    public ResponseEntity<WordBookDetailResponse> getWordBookDetail(@PathVariable("id") Long id) {
        WordBook wordBook = wordBookService.findById(id);
        return ResponseEntity.ok(toDetailResponse(wordBook));
    }


    /**
     * 단어장 상세 정보 응답 DTO 변환
     *
     * @param wordBook 단어장 엔티티
     * @return 단어장 상세 정보 응답 DTO
     * @see WordBookDetailResponse
     */
    private WordBookDetailResponse toDetailResponse(WordBook wordBook) {
        return new WordBookDetailResponse(
                wordBook.getId(),
                wordBook.getName(),
                wordBook.getDescription(),
                wordBook.getCategory(),
                wordBook.getCreatedAt(),
                wordBook.getUpdatedAt()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<WordBookResponse> updateWordBook(@PathVariable("id") Long id, @RequestBody WordBookRequest request) {
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
                wordBook.getCreatedAt(),
                wordBook.getUpdatedAt()
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

    @GetMapping("/study/{wordBookId}")
    public ResponseEntity<List<WordBookStudyResponse>> getStudyByWordBookId(@PathVariable("wordBookId") Long wordBookId) {
        List<EnglishWord> words = wordBookService.findAllByWordBookId(wordBookId);
        return ResponseEntity.ok().body(
                words.stream()
                        .map(this::toStudyResponse)
                        .toList());

    }

    private WordBookStudyResponse toStudyResponse(EnglishWord word) {
        return new WordBookStudyResponse(
                word.getId(),
                word.getVocabulary(),
                word.getMeaning(),
                word.getHint(),
                word.getDifficulty()
        );
    }

}
