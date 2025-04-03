package com.adam9e96.wordlol.controller.impl.rest;

import com.adam9e96.wordlol.common.constants.Constants;
import com.adam9e96.wordlol.controller.interfaces.rest.WordRestController;
import com.adam9e96.wordlol.dto.common.PageResponse;
import com.adam9e96.wordlol.dto.request.AnswerRequest;
import com.adam9e96.wordlol.dto.request.WordRequest;
import com.adam9e96.wordlol.dto.request.WordSearchRequest;
import com.adam9e96.wordlol.dto.response.*;
import com.adam9e96.wordlol.service.interfaces.StudyProgressService;
import com.adam9e96.wordlol.service.interfaces.WordService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    public ResponseEntity<CreateWordResponse> createWord(@Valid @RequestBody WordRequest request) {
        CreateWordResponse response = wordService.createWord(request);
//        log.info("단어 생성 성공: {}", response);
        return ResponseEntity.ok().body(response);
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
    public ResponseEntity<Void> updateWord(@PathVariable("id") Long id, @Valid @RequestBody WordRequest request) {
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
    @PostMapping(Constants.ApiPath.WORD_CHECK)
    public ResponseEntity<AnswerResponse> checkAnswer(@Valid @RequestBody AnswerRequest request, HttpSession session) {
        AnswerResponse response = wordService.checkAnswer(request, session);
//        log.info("정답 확인 결과: {}", response.toString());

        return ResponseEntity.ok().body(response);
    }

    @Override
    @GetMapping("/check-duplicate")
    public ResponseEntity<Map<String, Boolean>> checkVocabularyDuplicate(
            @RequestParam("vocabulary") String vocabulary,
            @RequestParam(value = "excludeId", required = false) Long excludeId) {

        boolean exists = wordService.checkVocabularyDuplicate(vocabulary, excludeId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @Override
    @GetMapping(Constants.ApiPath.WORD_HINT)
    public ResponseEntity<WordHintResponse> getWordHint(@PathVariable("id") Long id) {
        WordHintResponse response = wordService.getWordHint(id);

        return ResponseEntity.ok().body(response);
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
        List<DailyWordResponse> response = wordService.findRandomWords();
        return ResponseEntity.ok().body(response);
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
    @GetMapping(Constants.ApiPath.WORD_LIST)
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
        PageResponse<WordResponse> response = wordService.findAllWithPaging(pageable);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping(Constants.ApiPath.WORD_SEARCH)
    public ResponseEntity<PageResponse<WordResponse>> searchWords(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        WordSearchRequest searchRequest = new WordSearchRequest(keyword);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        PageResponse<WordResponse> response = wordService.searchWords(searchRequest, pageable);
        return ResponseEntity.ok(response);
    }

}
