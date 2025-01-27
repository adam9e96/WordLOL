package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.WordDto;
import com.adam9e96.WordLOL.dto.WordResponse;
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
    public ResponseEntity<WordDto> getRandomWord() {
        // 전체 단어 수를 기준으로 랜덤 ID 생성
        Random random = new Random();

        long randomId = random.nextInt(englishWordService.countAllWordList()) + 1; // 1 ~ countAllWordList() 사이의 랜덤 ID 생성
        WordDto word1 = englishWordService.findVocabularyById(randomId);

        // 힌트와 정답은 프론트에 바로 전달하지 않습니다.
        return ResponseEntity.ok().body(new WordDto(word1.getId(), word1.getVocabulary(), null, null));
    }

    @PostMapping("/check")
    public ResponseEntity<WordResponse> checkAnswer(@RequestBody Map<String, String> request) {
        String userAnswer = request.get("answer");
        Long wordId = Long.parseLong(request.get("wordId"));

        WordDto word1 = englishWordService.findVocabularyById(wordId);


        // 콤마로
        String[] correctAnswers1 = word1.getMeaning().split(",");

        // 배열의 답안 중 하나라도 일치하면 정답
        boolean isCorrect = Arrays.stream(correctAnswers1)
                .map(String::trim)
                .anyMatch(answer -> answer.equals(userAnswer));

        if (isCorrect) {
            streak++;
            return ResponseEntity.ok().body(new WordResponse(true, "정답입니다!", streak));
        } else {
            streak = 0;
            return ResponseEntity.ok().body(new WordResponse(false, "틀렸습니다. 다시 시도해보세요.", streak));
        }
    }

    @GetMapping("/{id}/hint")
    public ResponseEntity<Map<String, String>> getHint(@PathVariable Long id) {
        WordDto word1 = englishWordService.findVocabularyById(id);
        return ResponseEntity.ok().body(Map.of("hint", word1.getHint()));
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
    public ResponseEntity<List<WordDto>> getAllWords() {
        return ResponseEntity.ok().body(englishWordService.findAllWords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WordDto> getWord(@PathVariable Long id) {
        return ResponseEntity.ok().body(englishWordService.findVocabularyById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWord(@PathVariable Long id) {
        englishWordService.deleteWord(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateWord(@PathVariable Long id, @RequestBody WordDto request) {
        englishWordService.updateWord(id, request.getVocabulary(), request.getMeaning(), request.getHint());
        return ResponseEntity.ok().build();
    }


}