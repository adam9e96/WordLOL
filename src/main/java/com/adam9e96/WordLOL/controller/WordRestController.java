package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.WordRequest;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.dto.AnswerResponse;
import com.adam9e96.WordLOL.service.EnglishWordService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/words")
@Slf4j
@AllArgsConstructor
public class WordRestController {

    private final EnglishWordService englishWordService;
    private static int streak = 0; // 연속 정답 횟수를 추적하는 변수. 사용자가 연속으로 맞출 때마다 증가하고 틀리면 0 초기화

    @GetMapping("/random")
    public ResponseEntity<WordResponse> getRandomWord() {
        // 전체 단어 수를 기준으로 랜덤 ID 생성
        Random random = new Random();

        long randomId = random.nextInt(englishWordService.countAllWordList()) + 1; // 1 ~ countAllWordList() 사이의 랜덤 ID 생성
        WordResponse wordResponse = englishWordService.findVocabularyById(randomId);

        // 랜덤 ID에 해당하는 단어가 없으면 다시 랜덤 ID 생성
        if (wordResponse == null) {
            wordResponse = englishWordService.findVocabularyById(randomId);
        }
        // todo : 랜덤 ID에 해당하는 단어가 없으면 다시 랜덤 ID 생성하는 로직 추가


        // 힌트와 정답은 프론트에 바로 전달하지 않습니다.
        return ResponseEntity.ok().body(new WordResponse(
                wordResponse.id(),
                wordResponse.vocabulary(),
                null,
                null
        ));
    }

    @PostMapping("/check")
    public ResponseEntity<AnswerResponse> checkAnswer(@RequestBody Map<String, String> request) {
        String userAnswer = request.get("answer");
        Long wordId = Long.parseLong(request.get("wordId"));

        WordResponse wordResponse = englishWordService.findVocabularyById(wordId);
        String[] correctAnswers1 = wordResponse.meaning().split(",");

        // 배열의 답안 중 하나라도 일치하면 정답
        boolean isCorrect = Arrays.stream(correctAnswers1)
                .map(String::trim)
                .anyMatch(answer -> answer.equals(userAnswer));

        if (isCorrect) {
            streak++;
            return ResponseEntity.ok().body(new AnswerResponse(true, "정답입니다!", streak));
        } else {
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
    public ResponseEntity<Map<String, String>> registerWord(@RequestBody Map<String, String> word) {
        englishWordService.insertWord(
                word.get("vocabulary"),
                word.get("meaning"),
                word.get("hint")
        );
        return ResponseEntity.ok(Map.of("message", "success"));
    }

    @GetMapping("/list")
    public ResponseEntity<List<WordResponse>> getAllWords() {
        return ResponseEntity.ok().body(englishWordService.findAllWords());
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
                request.hint());
        return ResponseEntity.ok().build();
    }


}