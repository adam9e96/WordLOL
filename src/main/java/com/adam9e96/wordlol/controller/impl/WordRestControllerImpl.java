package com.adam9e96.wordlol.controller.impl;

import com.adam9e96.wordlol.common.Constants;
import com.adam9e96.wordlol.controller.interfaces.WordRestController;
import com.adam9e96.wordlol.dto.*;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.service.interfaces.StudyProgressService;
import com.adam9e96.wordlol.service.interfaces.WordService;
import jakarta.servlet.http.HttpSession;
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
@RequestMapping(Constants.ApiPath.WORDS)
@Slf4j
@RequiredArgsConstructor
public class WordRestControllerImpl implements WordRestController {

    private final WordService wordService;
    private final StudyProgressService studyProgressService;

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
    @GetMapping(Constants.ApiPath.WORD_ID)
    public ResponseEntity<WordResponse> getWord(@PathVariable("id") Long id) {
        WordResponse response = wordService.findById(id);
        return ResponseEntity.ok(response);
    }

    @Override
    @PutMapping(Constants.ApiPath.WORD_ID)
    public ResponseEntity<Void> updateWord(@PathVariable("id") Long id, @RequestBody WordRequest request) {
        wordService.updateWord(id, request);
        return ResponseEntity.ok().build();
    }

    @Override
    @DeleteMapping(Constants.ApiPath.WORD_ID)
    public ResponseEntity<Void> deleteWord(@PathVariable("id") Long id) {
        wordService.deleteWord(id);
        return ResponseEntity.ok().build();
    }

    @Override
    @GetMapping(Constants.ApiPath.WORD_RANDOM)
    public ResponseEntity<WordStudyResponse> getRandomWord() {
        WordStudyResponse response = wordService.findRandomWord();
        return ResponseEntity.ok(response);
    }


    @Override
    @PostMapping("/check")
    public ResponseEntity<AnswerResponse> checkAnswer(@Valid @RequestBody AnswerRequest request
            , HttpSession session) {
        boolean isCorrect = wordService.validateAnswer(request.wordId(), request.answer());

        AnswerResponse response;

        String sessionId = session.getId();
        if (isCorrect) {

            int newPerfectRun = studyProgressService.incrementPerfectRun(sessionId);
            response = new AnswerResponse(true, "정답입니다!", newPerfectRun);
        } else {
            studyProgressService.resetPerfectRun(sessionId);
            response = new AnswerResponse(false, "틀렸습니다. 다시 시도해보세요.", 0);
        }
        return ResponseEntity.ok().body(response);
    }

    @Override
    public ResponseEntity<Map<String, Boolean>> checkVocabularyDuplicate(String vocabulary, Long excludeId) {
        boolean exists = wordService.checkVocabularyDuplicate(vocabulary, excludeId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }


    @Override
    @GetMapping(Constants.ApiPath.WORD_HINT)
    public ResponseEntity<Map<String, String>> getWordHint(@PathVariable("id") Long id) {
        WordResponse wordResponse = wordService.findById(id);
        return ResponseEntity.ok().body(Map.of("hint", wordResponse.hint()));
    }

    @Override
    @GetMapping("/streak")
    public Map<String, Integer> getCurrentStreak(HttpSession session) {
        String sessionId = session.getId();
        int currentPerfectRun = studyProgressService.getCurrentPerfectRun(sessionId);
        return Map.of("perfectRun", currentPerfectRun);
    }


    @Override
    @GetMapping(Constants.ApiPath.WORD_DAILY)
    public ResponseEntity<List<DailyWordResponse>> getDailyWords() {
        List<Word> words = wordService.findRandomWords();
        return ResponseEntity.ok().body(
                toDailyWordListResponse(words));
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

    @Override
    @GetMapping("/search")
    public ResponseEntity<PageResponse<WordResponse>> searchWords(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        WordSearchRequest searchRequest = new WordSearchRequest(keyword);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Word> wordPage = wordService.searchWords(searchRequest, pageable);
        PageResponse<WordResponse> response = new PageResponse<>(
                wordPage.map(this::toWordResponse)
        );

        return ResponseEntity.ok(response);
    }


    private WordStudyResponse toWordStudyResponse(Word word) {
        return new WordStudyResponse(
                word.getId(),
                word.getVocabulary(),
                word.getMeaning(),
                word.getHint(),
                word.getDifficulty()
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


    private List<DailyWordResponse> toDailyWordListResponse(List<Word> words) {
        return words.stream()
                .map(word -> new DailyWordResponse(
                        word.getVocabulary(),
                        word.getMeaning(),
                        word.getDifficulty()))
                .toList();
    }
}
