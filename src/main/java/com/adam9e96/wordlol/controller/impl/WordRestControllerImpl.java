package com.adam9e96.wordlol.controller.impl;

import com.adam9e96.wordlol.controller.interfaces.WordRestController;
import com.adam9e96.wordlol.dto.*;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.service.interfaces.WordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/words")
@Slf4j
@RequiredArgsConstructor
public class WordRestControllerImpl implements WordRestController {

    private static int perfectRun = 0;
    private final WordService wordService;

    @Override
    @PostMapping
    public ResponseEntity<Map<String, Object>> createWord(@Valid @RequestBody WordRequest request) {
        wordService.createWord(request);
        return ResponseEntity.ok(Map.of("message", "success"));
    }

    @Override
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> createWords(@RequestBody List<WordRequest> requests) {
        int successCount = wordService.createWords(requests);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "success");
        response.put("count", successCount);

        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<WordResponse> getWord(@PathVariable("id") Long id) {
        WordResponse response = toResponse(wordService.findById(id));
        return ResponseEntity.ok(response);
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateWord(@PathVariable("id") Long id, @RequestBody WordRequest request) {
        wordService.updateWord(id, request);
        return ResponseEntity.ok().build();
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWord(@PathVariable("id") Long id) {
        wordService.deleteWord(id);
        return ResponseEntity.ok().build();
    }

    @Override
    @GetMapping("/random")
    public ResponseEntity<WordResponse> getRandomWord() {
        Word randomWord = wordService.findRandomWord();
        WordResponse response = toResponseWithoutAnswer(randomWord);
        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/check")
    public ResponseEntity<AnswerResponse> checkAnswer(@Valid @RequestBody AnswerRequest request) {
        boolean isCorrect = wordService.validateAnswer(request.wordId(), request.answer());

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

    @Override
    @GetMapping("/{id}/hint")
    public ResponseEntity<Map<String, String>> getWordHint(@PathVariable("id") Long id) {
        Word word = wordService.findById(id);
        return ResponseEntity.ok().body(Map.of("hint", word.getHint()));
    }

    @Override
    @GetMapping("/streak")
    public Map<String, Integer> getCurrentStreak() {
        return Map.of("perfectRun", perfectRun);
    }


    @Override
    @GetMapping("/daily")
    public ResponseEntity<List<WordResponse>> getDailyWords() {
        List<Word> words = wordService.findRandomWords();
        return ResponseEntity.ok().body(toResponseList(words));
    }

    /**
     * 단어 목록을 페이징하여 가져옵니다.
     * URL 에서 `?page=1&size=50` 같은 형식으로 요청을 받음
     * 파라미터가 없으면 기본값: 0페이지, 100개씩 조회
     *
     * @param page 페이지 번호
     * @param size 한 페이지에 보여줄 데이터(단어) 수
     * @return 단어 목록
     */
    @Override
    @GetMapping("/list")
    public ResponseEntity<PageResponse<WordResponse>> getWords(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {


        // 페이징 및 정렬 정보 생성
        // offset 과 limit 은 내부적으로 Pageable 에서 계산함
        /*
         * page : 페이지 번호 (0부터 시작)
         * size : 한 페이지당 항목 수
         * 내부적으로
         * offset = page * size
         * limit = size
         *
         * ex)
         * page =2, size=20 인 경우:
         * offset = 2 * 20 = 40 (41번째 레코드부터)
         * limit = 20 (20개 레코드)
         */

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Word> wordPage = wordService.findAllWithPaging(pageable);
        PageResponse<WordResponse> response = new PageResponse<>(
                wordPage.map(this::toWordResponse)
        );
        return ResponseEntity.ok(response);
    }


    private WordResponse toResponse(Word word) {
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

    private WordResponse toResponseWithoutAnswer(Word word) {
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

    private List<WordResponse> toResponseList(List<Word> words) {
        return words.stream()
                .map(this::toResponse)
                .toList();
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
}
