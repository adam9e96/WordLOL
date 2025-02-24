package com.adam9e96.wordlol.controller.interfaces;

import com.adam9e96.wordlol.dto.*;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

public interface WordRestController {
    @PostMapping
    ResponseEntity<Map<String, Object>> createWord(@Valid @RequestBody WordRequest request);

    @PostMapping("/batch")
    ResponseEntity<Map<String, Object>> createWords(@Valid @RequestBody List<WordRequest> requests);

    @GetMapping("/{id}")
    ResponseEntity<WordResponse> getWord(@PathVariable("id") Long id);

    @PutMapping("/{id}")
    ResponseEntity<Void> updateWord(@PathVariable("id") Long id, @Valid @RequestBody WordRequest request);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWord(@PathVariable("id") Long id);

    @GetMapping("/random")
    ResponseEntity<WordResponse> getRandomWord();

    @PostMapping("/check")
    ResponseEntity<AnswerResponse> checkAnswer(@Valid @RequestBody AnswerRequest request, HttpSession session);

    @GetMapping("/check-duplicate")
    ResponseEntity<Map<String, Boolean>> checkVocabularyDuplicate(
            @RequestParam String vocabulary,
            @RequestParam(required = false) Long excludeId);


    @GetMapping("/{id}/hint")
    ResponseEntity<Map<String, String>> getWordHint(@PathVariable("id") Long id);

    @GetMapping("/streak")
    Map<String, Integer> getCurrentStreak(HttpSession session);

    @GetMapping("/daily")
    ResponseEntity<List<DailyWordResponse>> getDailyWords();

    @GetMapping("/list")
    ResponseEntity<PageResponse<WordResponse>> getWords(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size);
}
