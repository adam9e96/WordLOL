package com.adam9e96.wordlol.service;

import com.adam9e96.wordlol.entity.EnglishWord;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.word.WordCreationException;
import com.adam9e96.wordlol.exception.word.WordNotFoundException;
import com.adam9e96.wordlol.exception.word.WordUpdateException;
import com.adam9e96.wordlol.mapper.WordMapper;
import com.adam9e96.wordlol.repository.EnglishWordRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;


@Service
@Slf4j
@RequiredArgsConstructor
public class EnglishWordService {
    private final EnglishWordRepository englishWordRepository;
    private final WordMapper wordMapper;
    private final Random random = new Random();

    public EnglishWord findById(Long id) {
        return wordMapper.findById(id)
                .orElseThrow(() -> new WordNotFoundException(id));
    }

    public void createWord(String vocabulary, String meaning, String hint, Integer difficulty) {
        try {
            // 입력값 검증
            if (!StringUtils.hasText(vocabulary)) {
                throw new ValidationException("단어를 입력해주세요.");
            }

            EnglishWord englishWord = EnglishWord.builder()
                    .vocabulary(vocabulary)
                    .meaning(meaning)
                    .hint(hint)
                    .difficulty(difficulty)
                    .build();

            wordMapper.save(englishWord);
        } catch (Exception e) {
            // DB 저장 실패 등의 문제 발생 시
            throw new WordCreationException(0L);  // 신규 생성이므로 임시 ID 0 사용
        }
    }

    @Transactional
    public void updateWord(Long id, String vocabulary, String meaning, String hint, Integer difficulty) {
        // 1. 기존 단어 존재 여부 확인
        EnglishWord word = wordMapper.findById(id).orElseThrow(() -> new WordNotFoundException(id));

        // 2. 비즈니스 로직 유효성 검증
        validateWordUpdateBusinessRules(vocabulary, meaning, hint, difficulty);

        try {
            // 3. 단어 업데이트
            word.update(vocabulary, meaning, hint, difficulty);
            englishWordRepository.save(word);
        } catch (Exception e) {
            log.error("단어 업데이트 중 오류가 발생했습니다. ID: {}", id, e);
            throw new WordUpdateException(id);
        }
    }

    private void validateWordUpdateBusinessRules(String vocabulary, String meaning, String hint, Integer difficulty) {
        // 1. 단어 중복 검사
        if (isDuplicateWord(vocabulary)) {
            throw new ValidationException("이미 존재하는 단어입니다.");
        }


        // 2. 단어와 의미의 길이 추가 검증
        validateWordAndMeaningLength(vocabulary, meaning);

        // 3. 힌트 길이 추가 검증 (선택사항)
        validateHintLength(hint);

        // 4. 난이도 추가 검증
        validateDifficulty(difficulty);
    }

    private boolean isDuplicateWord(String vocabulary) {
        // 대소문자 구분 없이 중복 확인
        return englishWordRepository.existsByVocabularyIgnoreCase(vocabulary);
    }

    private void validateWordAndMeaningLength(String vocabulary, String meaning) {
        // 단어와 의미의 실제 길이 검증 (공백 제거 후)
        // 2. 단어와 의미의 길이 검증
        if (vocabulary.trim().isEmpty() || vocabulary.trim().length() > 100) {
            throw new ValidationException("단어는 1자 이상 100자 이하로 입력해주세요.");
        }

        if (meaning.trim().isEmpty() || meaning.trim().length() > 100) {
            throw new ValidationException("뜻은 1자 이상 100자 이하로 입력해주세요.");
        }

    }


    private void validateHintLength(String hint) {
        // 3. 힌트 길이 검증
        if (hint.trim().length() > 100) {
            throw new ValidationException("힌트는 100자 이하로 입력해주세요.");
        }

    }

    private void validateDifficulty(Integer difficulty) {
        // 4. 난이도 검증
        if (difficulty == null || difficulty < 1 || difficulty > 5) {
            throw new ValidationException("난이도는 1에서 5 사이여야 합니다.");
        }
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
        EnglishWord wordResponse = findById(id);

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
