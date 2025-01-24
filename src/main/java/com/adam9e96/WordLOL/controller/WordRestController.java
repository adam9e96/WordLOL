package com.adam9e96.WordLOL.controller;

import com.adam9e96.WordLOL.dto.WordDto;
import com.adam9e96.WordLOL.dto.WordResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "*") // 개발환경용, 실제 운영시에는 구체적인 출처를 명시해야 합니다.
public class WordRestController {
    private final List<WordDto> words = new ArrayList<>();
    private static int streak = 0; // 연속 정답 횟수를 추적하는 변수. 사용자가 연속으로 맞출 때마다 증가하고 틀리면 0 초기화

    @PostConstruct
    public void init() {
        words.addAll(Arrays.asList(
                new WordDto(1L, "apple", "사과", "ㅅㄱ"),
                new WordDto(2L, "banana", "바나나", "ㅂㄴㄴ"),
                new WordDto(3L, "orange", "오렌지", "ㅇㄹㅈ")
        ));
    }

    @GetMapping("/random")
    public WordDto getRandomWord() {
        Random random = new Random();
        WordDto word = words.get(random.nextInt(words.size()));
        // 힌트와 정답은 프론트에 바로 전달하지 않습니다.
        return new WordDto(word.getId(), word.getEnglish(), null, null);
    }

    @PostMapping("/check")
    public WordResponse checkAnswer(
            @RequestBody Map<String, String> request) {
        String userAnswer = request.get("answer");
        Long wordId = Long.parseLong(request.get("wordId"));

        WordDto word = words.stream()
                .filter(w -> w.getId().equals(wordId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Word not found"));

        if (word.getKorean().equals(userAnswer)) {
            streak++;
            return new WordResponse(true, "정답입니다!", streak);
        } else {
            streak = 0;
            return new WordResponse(false, "틀렸습니다. 다시 시도해보세요.", streak);
        }
    }

    @GetMapping("/{id}/hint")
    public Map<String, String> getHint(@PathVariable Long id) {
        WordDto word = words.stream()
                .filter(w -> w.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Word not found"));

        return Map.of("hint", word.getHint());
    }

    @GetMapping("/streak")
    public Map<String, Integer> getStreak() {
        return Map.of("streak", streak);
    }
}