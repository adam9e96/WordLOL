package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.AnswerRequest;
import com.adam9e96.WordLOL.dto.AnswerResponse;
import com.adam9e96.WordLOL.dto.WordRequest;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.EnglishWord;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/words")
@Slf4j
@AllArgsConstructor
public class WordRestController {

    private static int perfectRun = 0; // 연속 정답 횟수를 추적하는 변수.
    private final EnglishWordService englishWordService;


    @GetMapping("/{id}")
    public ResponseEntity<WordResponse> getWord(@PathVariable Long id) {
        Optional<EnglishWord> wordOptional = englishWordService.findById(id);

        if (wordOptional.isEmpty()) {
            log.warn("단어를 찾을 수 없습니다. id: {}", id);
            return ResponseEntity.notFound().build();
        }

        WordResponse response = toResponse(wordOptional.get());
        return ResponseEntity.ok(response);
    }

    private WordResponse toResponse(EnglishWord word) {
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


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWord(@PathVariable Long id) {
        englishWordService.deleteWord(id);
        return ResponseEntity.ok().build();
    }


    @PutMapping("/{id}")
    public ResponseEntity<Void> updateWord(@PathVariable Long id, @RequestBody WordRequest request) {
        Optional<EnglishWord> updateWord = englishWordService.updateWord(
                id,
                request.vocabulary(),
                request.meaning(),
                request.hint(),
                request.difficulty()
        );

        if (updateWord.isEmpty()) {
            log.warn("수정할 단어를 찾을 수 없습니다. id: {}", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();

    }


    /**
     * study.js
     * @return
     */
    @GetMapping("/random")
    public ResponseEntity<WordResponse> getRandomWord() {
        Optional<EnglishWord> randomWord = englishWordService.getRandomWord();

        if (randomWord.isEmpty()) {
            log.warn("랜덤 단어를 찾을 수 없습니다.");
            return ResponseEntity.notFound().build();
        }
        WordResponse response = toResponseWithoutAnswer(randomWord.get());
        return ResponseEntity.ok(response);

    }

    private WordResponse toResponseWithoutAnswer(EnglishWord word) {
        return new WordResponse(
                word.getId(),
                word.getVocabulary(),
                null, // 정답 숨김
                null, // 힌트 숨김
                word.getDifficulty(),
                null, // 등록일 숨김
                null // 업데이트 숨김
        );
    }


    /**
     * study.js
     * 단어의 힌트를 조회
     * 해당 단어가 존재하면 힌트를 반환하고, 없으면 404 응답을 반환합니다.
     *
     * @param id 조회할 단어의 고유 ID
     * @return 단어의 힌트를 담은 Map
     */
    @GetMapping("/{id}/hint")
    public ResponseEntity<Map<String, String>> getHint(@PathVariable Long id) {
        Optional<EnglishWord> word = englishWordService.findById(id);

        if (word.isEmpty()) {
            log.warn("힌트를 찾을 수 없습니다. id: {}", id);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().body(Map.of("hint", word.get().getHint()));
    }

    /**
     * study.js
     * @param request
     * @return
     */
    @PostMapping("/check")
    public ResponseEntity<AnswerResponse> checkAnswer(@Valid @RequestBody AnswerRequest request) {
        boolean isCorrect = englishWordService.checkAnswer(request.wordId(), request.answer());
        AnswerResponse response;

        if (isCorrect) {
            perfectRun++;
            response = new AnswerResponse(true, "정답입니다!", perfectRun);
        } else {
            perfectRun = 0;
            response = new AnswerResponse(false, "틀렸습니다. 다시 시도해보세요.", perfectRun);

        }
        return ResponseEntity.ok().body(response);
    }

    /**
     * study.js
     * @return
     */
    @GetMapping("/perfectRun")
    public Map<String, Integer> getPerfectRun() {
        return Map.of("perfectRun", perfectRun);
    }


    @GetMapping("/daily-words")
    public ResponseEntity<List<WordResponse>> getDailyWords() {
        List<EnglishWord> words = englishWordService.findRandom5Words();
        List<WordResponse> response = toResponseList(words);

        return ResponseEntity.ok().body(response);
    }

    private List<WordResponse> toResponseList(List<EnglishWord> words) {
        return words.stream()
                .map(this::toResponse)
                .toList();

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
            @RequestParam(defaultValue = "20") int size) { // 한 페이지에 보여줄 데이터(단어) 수

        // Pageable 객체 생성
        // PageRequest.of(페이지 번호, 페이지 크기, 정렬 방식) : 페이징 정보를 담는 객체를 생성
        // 페이징 정보 생성
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        // 서비스에서 엔티티 페이지 조회
        Page<EnglishWord> wordPage = englishWordService.findAllWordsWithPaging(pageable);

        // 엔티티 페이지를 DTO 페이지로 변환
        Page<WordResponse> responsePage = wordPage.map(this::toResponse);

        return ResponseEntity.ok(responsePage);
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
        englishWordService.createWord(
                request.vocabulary(),
                request.meaning(),
                request.hint(),
                request.difficulty()
        );
        return ResponseEntity.ok(Map.of("message", "success"));
    }


    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> registerWords(@Valid @RequestBody List<WordRequest> requests) {
        try {
            int successCount = 0;
            for (WordRequest request : requests) {
                englishWordService.createWord(
                        request.vocabulary(),
                        request.meaning(),
                        request.hint(),
                        request.difficulty()
                );
                successCount++;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "success");
            response.put("count", successCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("단어 일괄 등록 실패", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "error");
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
