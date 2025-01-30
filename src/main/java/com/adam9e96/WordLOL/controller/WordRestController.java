package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.WordRequest;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.dto.AnswerResponse;
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
    private static int streak = 0; // 연속 정답 횟수를 추적하는 변수. 사용자가 연속으로 맞출 때마다 증가하고 틀리면 0 초기화

    @GetMapping("/random")
    public ResponseEntity<WordResponse> getRandomWord() {

        /*
         * 단어가 하나도 없으면 404 Not Found를 반환합니다.
         * 성능 향상을 위해 존재하는 ID 목록을 가져옵니다.
         */
        int totalWords = englishWordService.countAllWordList();

        if (totalWords == 0) {
            return ResponseEntity.notFound().build();
        }

        /*
         * 존재하는 단어 ID 목록을 가져옵니다.
         */
        List<Long> existingIds = englishWordService.findAllIds();
//        log.info("existingIds: {}", existingIds);

        Random random = new Random();
        Long randomId = existingIds.get(random.nextInt(existingIds.size()));
        WordResponse wordResponse = englishWordService.findVocabularyById(randomId);


        // 힌트와 정답은 프론트에 바로 전달하지 않습니다.
        return ResponseEntity.ok().

                body(new WordResponse(
                        wordResponse.id(),
                        wordResponse.vocabulary(),
                        null,
                        null
                ));
    }

    @PostMapping("/check")
    public ResponseEntity<AnswerResponse> checkAnswer(@RequestBody Map<String, String> request) {

        // 사용자가 입력한 답안과 정답 가져오기
        String userAnswer = request.get("answer");
        Long wordId = Long.parseLong(request.get("wordId"));

        // DB에서 정답 가져오기
        WordResponse wordResponse = englishWordService.findVocabularyById(wordId);

        // 정답을 쉼표로 구분하여 뜻을 배열로 만듭니다.
        String[] correctAnswers1 = wordResponse.meaning().split(",");

        // 배열의 답안 중 하나라도 일치하면 정답
        boolean isCorrect = Arrays.stream(correctAnswers1)
                .map(String::trim) // 앞뒤 공백 제거
                .anyMatch(answer -> answer.equals(userAnswer));

        if (isCorrect) {
            streak++;
            return ResponseEntity.ok().body(new AnswerResponse(true, "정답입니다!", streak));
        } else {
            // 틀리면 streak를 0으로 초기화
            streak = 0;
            return ResponseEntity.ok().body(new AnswerResponse(false, "틀렸습니다. 다시 시도해보세요.", streak));
        }
    }

    @GetMapping("/{id}/hint")
    public ResponseEntity<Map<String, String>> getHint(@PathVariable Long id) {
        WordResponse wordResponse = englishWordService.findVocabularyById(id);
        return ResponseEntity.ok().body(Map.of("hint", wordResponse.hint()));
    }

    @GetMapping("/streak")
    public Map<String, Integer> getStreak() {
        return Map.of("streak", streak);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerWord(@Valid @RequestBody WordRequest request, BindingResult bindingResult) {

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
                request.hint()
        );
        return ResponseEntity.ok(Map.of("message", "success"));
    }

//    @GetMapping("/list")
//    public ResponseEntity<List<WordResponse>> getAllWords() {
//        return ResponseEntity.ok().body(englishWordService.findAllWords());
//    }

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
                request.hint());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/list")
    public ResponseEntity<Page<WordResponse>> getAllWords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return ResponseEntity.ok().body(englishWordService.findAllWordsWithPaging(pageable));
    }


}