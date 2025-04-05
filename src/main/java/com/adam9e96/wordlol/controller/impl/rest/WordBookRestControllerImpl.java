package com.adam9e96.wordlol.controller.impl.rest;

import com.adam9e96.wordlol.common.constants.Constants;
import com.adam9e96.wordlol.controller.interfaces.rest.WordBookRestController;
import com.adam9e96.wordlol.dto.request.WordBookRequest;
import com.adam9e96.wordlol.dto.response.*;
import com.adam9e96.wordlol.enums.Category;
import com.adam9e96.wordlol.service.interfaces.WordBookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(Constants.ApiPath.WORD_BOOKS)
@RequiredArgsConstructor
public class WordBookRestControllerImpl implements WordBookRestController {
    private final WordBookService wordBookService;

    @Override
    @PostMapping
    public ResponseEntity<WordBookResponse> createWordBook(@RequestBody @Valid WordBookRequest request) {
        WordBookResponse response = wordBookService.createWordBook(request);
        return ResponseEntity.ok().body(response);
    }

    @Override
    @GetMapping(Constants.ApiPath.WORD_BOOKS_WORDS)
    public ResponseEntity<List<WordResponse>> getWordBookWords(@PathVariable("id") Long id) {
        List<WordResponse> responses = wordBookService.findWordsByWordBookId(id);
        return ResponseEntity.ok().body(responses);
    }

    // JS에서 URL 경로를 지워버리는 버그있음 작동은 잘됨
    @Override
    @GetMapping(Constants.ApiPath.WORD_BOOKS_CATEGORY)
    public ResponseEntity<List<WordResponse>> getWordsByCategoryName(@PathVariable("category") Category category) {
        log.info("니니아");
        return ResponseEntity.ok().body(
                wordBookService.getAllWordsFromWordBooksByCategory(category));
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
        List<WordBookResponse> response = wordBookService.getWordBooksByCategory(category);
        return ResponseEntity.ok().body(response);
    }

    @Override
    @DeleteMapping(Constants.ApiPath.WORD_BOOKS_ID)
    public ResponseEntity<Void> deleteWordBook(@PathVariable("id") Long id) {
        wordBookService.deleteWordBookById(id);
        return ResponseEntity.ok().build();
    }

    @Override
    @GetMapping(Constants.ApiPath.WORD_BOOKS_ID)
    public ResponseEntity<WordBookDetailResponse> getWordBook(@PathVariable("id") Long id) {
        WordBookDetailResponse response = wordBookService.findWordBookById(id);
        return ResponseEntity.ok().body(response);
    }

    @Override
    @PutMapping(Constants.ApiPath.WORD_BOOKS_ID)
    public ResponseEntity<WordBookResponse> updateWordBook(
            @PathVariable("id") Long id,
            @Valid @RequestBody WordBookRequest request) {
        WordBookResponse response = wordBookService.updateWordBookById(id, request);
        return ResponseEntity.ok().body(response);
    }

    @Override
    @GetMapping(Constants.ApiPath.WORD_BOOKS_STUDY)
    public ResponseEntity<List<WordBookStudyResponse>> getWordBookStudyData(
            @PathVariable("id") Long id) {
        List<WordBookStudyResponse> response = wordBookService.findWordBookStudyData(id);
        return ResponseEntity.ok(response);
    }

}
