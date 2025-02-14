package com.adam9e96.wordlol.service;

import com.adam9e96.wordlol.entity.EnglishWord;
import com.adam9e96.wordlol.mapper.WordMapper;
import com.adam9e96.wordlol.repository.EnglishWordRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;


@Service
@Slf4j
@AllArgsConstructor
public class EnglishWordService {
    private final EnglishWordRepository englishWordRepository;
    private final WordMapper wordMapper;
    private final Random random = new Random();

    /**
     * READ
     * ID로 단어 조회
     * study.js
     */
    public Optional<EnglishWord> findById(Long id) {
        return wordMapper.findById(id);
    }

    /**
     * CREATE
     * 단어를 추가합니다.
     */
    public void createWord(String vocabulary, String meaning, String hint, Integer difficulty) {
        EnglishWord englishWord = EnglishWord.builder()
                .vocabulary(vocabulary)
                .meaning(meaning)
                .hint(hint)
                .difficulty(difficulty)
                .build();
        englishWordRepository.save(englishWord);
    }


    /**
     * UPDATE
     * 단어를 수정합니다.
     */
    @Transactional
    public Optional<EnglishWord> updateWord(Long id, String vocabulary, String meaning, String hint, Integer difficulty) {
        return wordMapper.findById(id)
                .map(word -> {
                    word.update(vocabulary, meaning, hint, difficulty);
                    return englishWordRepository.save(word);
                });
    }


    /**
     * DELETE
     * 단어를 삭제합니다.
     */
    public void deleteWord(Long id) {
        try {
            wordMapper.deleteById(id);
        } catch (Exception e) {
            log.error("단어 삭제 중 오류가 발생했습니다. ID: {}", id, e);
            throw new IllegalStateException("단어 삭제 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 페이징 처리된 단어 목록을 조회합니다.
     *
     * @param pageable 페이징 정보
     * @return 페이징 처리된 단어 목록
     */
    public Page<EnglishWord> findAllWordsWithPaging(Pageable pageable) {
        try {
            return englishWordRepository.findAll(pageable);
        } catch (Exception e) {
            log.error("페이징된 단어 목록 조회 중 실패했습니다", e);
            throw new IllegalStateException("단어 목록 조회 중 오류가 발생했습니다", e);
        }
    }


    /**
     * 랜덤 단어를 조회합니다.
     * 단어가 없으면 빈 Optional 반환
     * study.js
     */
    public Optional<EnglishWord> getRandomWord() {
        // 전체 단어 개수 조회
        List<Long> ids = wordMapper.findAllIds();

        if (ids.isEmpty()) {
            return Optional.empty();
        }

        Long randomId = ids.get(random.nextInt(ids.size()));
        return wordMapper.findById(randomId);

    }

    /**
     * study.js
     * 사용자가 입력한 답변이 해당 영어 단어의 의미와 일치하는지 확인합니다.
     *
     * @param id         검증할 영어 단어의 고유 ID
     * @param userAnswer 사용자가 입력한 답변
     * @return 정답이 맞으면 true, 틀리면 false
     * @throws IllegalArgumentException 단어가 존재하지 않는 경우
     */
    public Boolean checkAnswer(Long id, String userAnswer) {
        // 단어 조회
        Optional<EnglishWord> wordResponseOptional = findById(id);
        if (wordResponseOptional.isEmpty()) {
            throw new IllegalArgumentException("존재하지 않는 단어 ID입니다. ID: " + id);
        }
        EnglishWord wordResponse = wordResponseOptional.get();
        // 정답 배열 생성 및 공백 제거
        String[] correctAnswers = wordResponse.getMeaning().split(",");

        return Arrays.stream(correctAnswers)
                .map(String::trim)
                .anyMatch(word -> word.equals(userAnswer));

    }

    public List<EnglishWord> findRandom5Words() {
        return wordMapper.findRandom5Words();
    }

}
