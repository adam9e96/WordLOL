package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.WordDto;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.service.EnglishWordService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/words")
@Slf4j
@AllArgsConstructor
public class WordRestController {

    private final EnglishWordService englishWordService;
    //    private final List<WordDto> words = new ArrayList<>();
    private static int streak = 0; // 연속 정답 횟수를 추적하는 변수. 사용자가 연속으로 맞출 때마다 증가하고 틀리면 0 초기화

//    @PostConstruct
//    public void init() {
//        words.addAll(Arrays.asList(
//                new WordDto(1L, "apple", "사과", "ㅅㄱ"),
//                new WordDto(2L, "banana", "바나나", "ㅂㄴㄴ"),
//                new WordDto(3L, "orange", "오렌지", "ㅇㄹㅈ"),
//                new WordDto(4L, "cover up", "숨기다,가리다", "ㅅㄱㄷ,ㄱㄹㄷ"),
//                new WordDto(5L, "look for", "찾다", "ㅊㄷ"),
//                new WordDto(6L, "get in the way", "방해가 되다", "ㅂㅎㄱ ㄷㄷ"),
//                new WordDto(7L, "rain or shine", "비가 오든 날이 개든", "ㅂㄱ ㅇㄷ ㄴㅇ ㄱㄷ"),
//                new WordDto(8L, "be used", "사용되다", "ㅅㅇㄷㄷ")
//        ));
//    }

    @GetMapping("/random")
    public ResponseEntity<WordDto> getRandomWord() {
        // 전체 단어 수를 기준으로 랜덤 ID 생성
        Random random = new Random();

        long randomId = random.nextInt(englishWordService.countAllWordList()) + 1; // 1 ~ countAllWordList() 사이의 랜덤 ID 생성
        WordDto word1 = englishWordService.findVocabularyById(randomId);

        // 힌트와 정답은 프론트에 바로 전달하지 않습니다.
//        return ResponseEntity.ok().body(new WordDto(word.getId(), word.getEnglish(), null, null));
        return ResponseEntity.ok().body(new WordDto(word1.getId(), word1.getEnglish(), null, null));
    }

    @PostMapping("/check")
    public ResponseEntity<WordResponse> checkAnswer(@RequestBody Map<String, String> request) {
        String userAnswer = request.get("answer");
        Long wordId = Long.parseLong(request.get("wordId"));

//        WordDto word = words.stream()
//                .filter(w -> w.getId().equals(wordId))
//                .findFirst()
//                .orElseThrow(() -> new RuntimeException("단어를 찾을 수 없습니다."));
        WordDto word1 = englishWordService.findVocabularyById(wordId);


        // 콤마로
//        String[] correctAnswers = word.getKorean().split(",");
        String[] correctAnswers1 = word1.getKorean().split(",");

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

//        if (word.getKorean().equals(userAnswer)) {
//            streak++;
//            return ResponseEntity.ok().body(new WordResponse(true, "정답입니다!", streak));
//        } else {
//            streak = 0;
//            return ResponseEntity.ok().body(new WordResponse(false, "틀렸습니다. 다시 시도해보세요.", streak));
//        }
    }

    @GetMapping("/{id}/hint")
    public ResponseEntity<Map<String, String>> getHint(@PathVariable Long id) {
//        WordDto word = words.stream()
//                .filter(w -> w.getId().equals(id))
//                .findFirst()
//                .orElseThrow(() -> new RuntimeException("Word not found"));
        WordDto word1 = englishWordService.findVocabularyById(id);
        return ResponseEntity.ok().body(Map.of("hint", word1.getHint()));
//        return ResponseEntity.ok().body(Map.of("hint", word.getHint()));
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

//    @GetMapping("/list")
//    public ResponseEntity<Map<String, Integer>> getWordList() {
//        WordDto word =
//    }
}