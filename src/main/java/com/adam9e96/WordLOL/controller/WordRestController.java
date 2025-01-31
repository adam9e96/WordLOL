package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.AnswerRequest;
import com.adam9e96.WordLOL.dto.AnswerResponse;
import com.adam9e96.WordLOL.dto.WordRequest;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.service.EnglishWordService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/words")
@Slf4j
@AllArgsConstructor
public class WordRestController {

    private final EnglishWordService englishWordService;
    private static int perfectRun = 0; // 연속 정답 횟수를 추적하는 변수.

    @GetMapping("/random")
    public ResponseEntity<WordResponse> getRandomWord() {

        Optional<WordResponse> wordResponse = englishWordService.getRandomWord();

        // 단어가 없으면 404 에러 반환
        // 단어가 있으면 정답과 힌트를 제외한 정보만 반환해서 200 OK 반환
        return wordResponse.map(
                response -> ResponseEntity
                        .ok()
                        .body(hideSecretInfo(response))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/check")
    public ResponseEntity<AnswerResponse> checkAnswer(@Valid @RequestBody AnswerRequest request) {
        Boolean isCorrect = englishWordService.checkAnswer(request.wordId(), request.answer());

        if (isCorrect) {
            perfectRun++;
            return ResponseEntity.ok().body(new AnswerResponse(true, "정답입니다!", perfectRun));
        } else {
            // 틀리면 streak를 0으로 초기화
            perfectRun = 0;
            return ResponseEntity.ok().body(new AnswerResponse(false, "틀렸습니다. 다시 시도해보세요.", perfectRun));
        }
    }

    @GetMapping("/{id}/hint")
    public ResponseEntity<Map<String, String>> getHint(@PathVariable Long id) {
        WordResponse wordResponse = englishWordService.findVocabularyById(id);
        return ResponseEntity.ok().body(Map.of("hint", wordResponse.hint()));
    }

    @GetMapping("/streak")
    public Map<String, Integer> getPerfectRun() {
        return Map.of("streak", perfectRun);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerWord(
            @Valid @RequestBody WordRequest request, BindingResult bindingResult) {

        // 유효성 검사 실패 시
        if (bindingResult.hasErrors()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("message", "입력 검증 실패");

            List<String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .toList();
            errorResponse.put("errors", errors);

            return ResponseEntity
                    .badRequest()
                    .body(errorResponse);
        }
        // 유효성 검사 통과시
        englishWordService.insertWord(
                request.vocabulary(),
                request.meaning(),
                request.hint(),
                request.difficulty()
        );
        return ResponseEntity.ok(Map.of("message", "success"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WordResponse> getWord(@PathVariable Long id) {
        return ResponseEntity.ok().body(englishWordService.findVocabularyById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWord(@PathVariable Long id) {
        englishWordService.deleteWord(id);
        return ResponseEntity.ok().build();
    }


    @PutMapping("/{id}")
    public ResponseEntity<Void> updateWord(@PathVariable Long id, @RequestBody WordRequest request) {
        englishWordService.updateWord(
                id,
                request.vocabulary(),
                request.meaning(),
                request.hint(),
                request.difficulty());
        return ResponseEntity.ok().build();
    }

    /**
     * 단어 목록을 페이징하여 가져옵니다.
     * URL에서 `?page=1&size=50` 같은 형식으로 요청을 받음
     * 파라미터가 없으면 기본값: 0페이지, 100개씩 조회
     *
     * @param page 페이지 번호
     * @param size 한 페이지에 보여줄 데이터(단어) 수
     * @return 단어 목록
     */
    @GetMapping("/list")
    public ResponseEntity<Page<WordResponse>> getAllWords(
            @RequestParam(defaultValue = "0") int page, // 페이지 번호 (0부터 시작)
            @RequestParam(defaultValue = "100") int size) { // 한 페이지에 보여줄 데이터(단어) 수

        // Pageable 객체 생성
        // PageRequest.of(페이지 번호, 페이지 크기, 정렬 방식) : 페이징 정보를 담는 객체를 생성
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return ResponseEntity.ok().body(englishWordService.findAllWordsWithPaging(pageable));
    }

    /**
     * 정답과 힌트를 제외한 정보를 반환합니다.
     *
     * @param wordResponse 단어 정보
     * @return 정답과 힌트를 제외한 정보
     */
    private WordResponse hideSecretInfo(WordResponse wordResponse) {
        return new WordResponse(
                wordResponse.id(),
                wordResponse.vocabulary(),
                null,
                null,
                null,
                null,
                null
        );
    }


}