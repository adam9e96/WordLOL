package com.adam9e96.wordlol.controller;

import com.adam9e96.wordlol.dto.*;
import com.adam9e96.wordlol.entity.EnglishWord;
import com.adam9e96.wordlol.service.EnglishWordService;
import com.adam9e96.wordlol.service.StudyProgressService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/words")
@Slf4j
@AllArgsConstructor
public class WordRestController {

    // #todo perfectRun 변수 대신 db 를 통해 관리되도록 하기
    private static int perfectRun = 0; // 연속 정답 횟수를 추적하는 변수.
    private final EnglishWordService englishWordService;
    private final StudyProgressService studyProgressService;


    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerWord(@Valid @RequestBody WordRequest request) {
        englishWordService.createWord(
                request.vocabulary(),
                request.meaning(),
                request.hint(),
                request.difficulty()
        );
        return ResponseEntity.ok(Map.of("message", "success"));
    }


    @PostMapping("/registers")
    public ResponseEntity<Map<String, Object>> registerWords(@Valid @RequestBody List<WordRequest> requests) {
        int successCount = englishWordService.createWords(requests);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "success");
        response.put("count", successCount);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WordResponse> getWord(@PathVariable("id") Long id) {
        WordResponse response = toResponse(englishWordService.findById(id));
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

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateWord(@PathVariable("id") Long id, @Valid @RequestBody WordRequest request) {
        englishWordService.updateWord(
                id,
                request.vocabulary(),
                request.meaning(),
                request.hint(),
                request.difficulty()
        );
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWord(@PathVariable("id") Long id) {
        englishWordService.deleteWord(id);
        return ResponseEntity.ok().build();
    }


    // ========================================================================================================
    @GetMapping("/random")
    public ResponseEntity<WordResponse> getRandomWord() {
        EnglishWord randomWord = englishWordService.getRandomWord();
        WordResponse response = toResponseWithoutAnswer(randomWord);
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

    @GetMapping("/{id}/hint")
    public ResponseEntity<Map<String, String>> getHint(@PathVariable("id") Long id) {
        EnglishWord word = englishWordService.findById(id);
        return ResponseEntity.ok().body(Map.of("hint", word.getHint()));
    }

    @GetMapping("/perfectRun")
    public Map<String, Integer> getPerfectRun() {
        return Map.of("perfectRun", perfectRun);
    }


    @GetMapping("/daily-words")
    public ResponseEntity<List<WordResponse>> getDailyWords() {
        List<EnglishWord> words = englishWordService.findRandom5Words();
        return ResponseEntity.ok().body(toResponseList(words));
    }

    private List<WordResponse> toResponseList(List<EnglishWord> words) {
        return words.stream()
                .map(this::toResponse)
                .toList();
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
    @GetMapping("/list")
    public ResponseEntity<PageResponse<WordResponse>> getAllWords(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {


        // 페이징 및 정렬 정보 생성
        // offset 과 limit 은 내부적으로 Pageable에서 계산함
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
        Pageable pageable = PageRequest.of(page, size);

        // 서비스에서 페이징된 데이터 조회
        Page<EnglishWord> wordPage = englishWordService.findAllWordsWithPaging(pageable);

        Page<WordResponse> responsePage = wordPage.map(this::toResponse);

        // 커스텀 응답 객체 생성
        PageResponse<WordResponse> pageResponse = new PageResponse<>(responsePage);

        return ResponseEntity.ok(pageResponse);
    }


}
