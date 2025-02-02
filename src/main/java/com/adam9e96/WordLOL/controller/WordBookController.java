package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.WordBookRequest;
import com.adam9e96.WordLOL.dto.WordBookResponse;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.service.WordBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wordbooks")
@RequiredArgsConstructor
public class WordBookController {
    private final WordBookService wordBookService;

    @PostMapping
    public ResponseEntity<WordBookResponse> createWordBook(@RequestBody WordBookRequest request) {
        return ResponseEntity.ok(wordBookService.createWordBook(request));
    }

    @GetMapping("/{id}/words")
    public ResponseEntity<Page<WordResponse>> getWordsInBook(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(wordBookService.getWordsInBook(id,
                PageRequest.of(page, size)));
    }
}
