package com.adam9e96.wordlol.controller.interfaces;

import com.adam9e96.wordlol.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

public interface WordRestController {
    @PostMapping("/register")
    ResponseEntity<Map<String, Object>> createWord(@Valid @RequestBody WordRequest request);

    @PostMapping("/registers")
    ResponseEntity<Map<String, Object>> createWords(@Valid @RequestBody List<WordRequest> requests);

    @GetMapping("/{id}")
    ResponseEntity<WordResponse> findWord(@PathVariable("id") Long id);

    @PutMapping("/{id}")
    ResponseEntity<Void> updateWord(@PathVariable("id") Long id, @RequestBody WordRequest request);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWord(@PathVariable("id") Long id);

    @GetMapping("/random")
    ResponseEntity<WordResponse> getRandomWord();

    @PostMapping("/check")
    ResponseEntity<AnswerResponse> validateAnswer(@Valid @RequestBody AnswerRequest request);

    @GetMapping("/{id}/hint")
    ResponseEntity<Map<String, String>> getHint(@PathVariable("id") Long id);

    @GetMapping("/perfectRun")
    Map<String, Integer> getPerfectRun();

    @GetMapping("/daily-words")
    ResponseEntity<List<WordResponse>> getTodayWords();

    @GetMapping("/list")
    ResponseEntity<PageResponse<WordResponse>> findWordsWithPaging(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size);
}
