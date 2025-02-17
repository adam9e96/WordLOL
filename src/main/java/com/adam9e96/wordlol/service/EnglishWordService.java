package com.adam9e96.wordlol.service;

import com.adam9e96.wordlol.dto.WordRequest;
import com.adam9e96.wordlol.entity.EnglishWord;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.word.WordCreationException;
import com.adam9e96.wordlol.exception.word.WordDeletionException;
import com.adam9e96.wordlol.exception.word.WordNotFoundException;
import com.adam9e96.wordlol.exception.word.WordUpdateException;
import com.adam9e96.wordlol.mapper.WordMapper;
import com.adam9e96.wordlol.repository.EnglishWordRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Random;


@Service
@Slf4j
@RequiredArgsConstructor
public class EnglishWordService {
    private final EnglishWordRepository englishWordRepository;
    private final WordMapper wordMapper;
    private final Random random = new Random();

    public void createWord(String vocabulary, String meaning, String hint, Integer difficulty) {
        try {
            // 1. 입력값 검증
            validateCreateWordInput(vocabulary, meaning, hint, difficulty);
            // 2. 중복 단어 검사
            if (isDuplicateWord(vocabulary)) {
                throw new ValidationException("이미 존재하는 단어입니다: " + vocabulary);
            }

            // 3. 엔티티 생성
            EnglishWord englishWord = EnglishWord.builder()
                    .vocabulary(vocabulary)
                    .meaning(meaning)
                    .hint(hint)
                    .difficulty(difficulty)
                    .build();

            // 4. DB에 저장
            wordMapper.save(englishWord);
        } catch (ValidationException e) {
            // 유효성 검사 실행
            throw e;
        } catch (Exception e) {
            // DB 저장 실패 등의 문제 발생 시
            log.error("단어 생성 중 오류가 발생: {}", e.getMessage(), e);
            throw new WordCreationException(0L);  // 신규 생성이므로 임시 ID 0 사용
        }
    }

    private void validateCreateWordInput(String vocabulary, String meaning, String hint, Integer difficulty) {

        // 1. 단어 검증
        if (!StringUtils.hasText(vocabulary)) {
            throw new ValidationException("단어를 입력해주세요.");
        }
        if (!vocabulary.matches("^[a-zA-Z\\s-]+$")) {
            throw new ValidationException("영단어는 영문자, 공백, 하이픈만 포함할 수 있습니다.");
        }
        if (vocabulary.length() > 100) {
            throw new ValidationException("단어는 100자를 초과할 수 없습니다.");
        }

        // 2. 의미 검증
        if (!StringUtils.hasText(meaning)) {
            throw new ValidationException("뜻을 입력해주세요.");
        }
        if (meaning.length() > 100) {
            throw new ValidationException("뜻은 100자를 초과할 수 없습니다.");
        }

        // 3. 힌트 길이 검증 (선택 사항)
        if (hint.length() > 100) {
            throw new ValidationException("힌트는 100자를 초과할 수 없습니다.");
        }

        // 4. 난이도 검증
        if (difficulty == null || difficulty < 1 || difficulty > 5) {
            throw new ValidationException("난이도는 1에서 5 사이의 값이어야 합니다.");
        }
    }

    private boolean isDuplicateWord(String vocabulary) {
        // 대소문자 구분 없이 중복 확인
        return englishWordRepository.existsByVocabularyIgnoreCase(vocabulary);
    }

    @Transactional
    public int createWords(List<WordRequest> requests) {
        // 1. 요청이 없으면 0 반환
        if (requests == null || requests.isEmpty()) {
            return 0;
        }
        // 2. 성공한 단어 개수
        int successCount = 0;
        // 3. 요청 단어들을 순회하며 단어 생성 시도
        for (WordRequest request : requests) {
            try {
                createWord(
                        request.vocabulary(),
                        request.meaning(),
                        request.hint(),
                        request.difficulty()
                );
                // 단어 생성 성공 시 성공 카운트 증가
                successCount++;
            } catch (Exception e) {
                log.error("단어 생성 실패: {}", request.vocabulary(), e);
                // 예외를 잡아서 계속 진행할지, 아니면 전체 트랜잭션을 실패시킬지는
                // 비즈니스 요구사항에 따라 결정
            }
        }
        return successCount;
    }


    public EnglishWord findById(Long id) {
        return wordMapper.findById(id)
                .orElseThrow(() -> new WordNotFoundException(id));
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
            wordMapper.save(word);
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
        // 단어와 의미의 실제 길이 검증 (공백 제거 후)
        // 2. 단어와 의미의 길이 검증
        if (vocabulary.trim().isEmpty() || vocabulary.trim().length() > 100) {
            throw new ValidationException("단어는 1자 이상 100자 이하로 입력해주세요.");
        }
        if (meaning.trim().isEmpty() || meaning.trim().length() > 100) {
            throw new ValidationException("뜻은 1자 이상 100자 이하로 입력해주세요.");
        }
        // 3. 힌트 길이 추가 검증 (선택사항)
        if (hint.trim().length() > 100) {
            throw new ValidationException("힌트는 100자 이하로 입력해주세요.");
        }
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
            // 단어 존재 여부 확인
            if (!wordMapper.existsById(id)) {
                throw new WordNotFoundException(id);
            }
            // 단어 삭제
            wordMapper.deleteById(id);
        } catch (WordDeletionException e) {
            log.error("단어 삭제 중 오류 발생: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("단어 삭제 중 오류 발생: {}", e.getMessage(), e);
            throw new WordDeletionException(id);
        }
    }

    // ================================================================================================================

    public EnglishWord getRandomWord() {
        // 1. 전체 단어 ID 목록 조회
        List<Long> ids = wordMapper.findAllIds();
        if (ids.isEmpty()) {
            throw new WordNotFoundException(0L); // 또는 NoWordsAvailableException 생성 고려
        }
        // 2. 랜덤 ID 선택
        Long randomId = ids.get(random.nextInt(ids.size()));
        // 3. 선택된 ID로 단어 조회
        return findById(randomId);
    }

    // 답이 2개인경우 가능
    // 답안중에 중간에 띄어쓰기는 아직 안됨(띄어 쓰기도 포함해야 인정됨)
    public Boolean checkAnswer(Long id, String userAnswer) {
        // 1. 단어 조회
        EnglishWord englishWord = findById(id);
        log.info("정답: {}, 사용자 입력: {}", englishWord.getMeaning(), userAnswer);
        // 2. 정답 확인
        return validateAnswer(englishWord.getMeaning(), userAnswer);
    }

    private boolean validateAnswer(String correctMeaning, String userAnswer) {
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            throw new ValidationException("답을 입력해주세요.");
        }
        // 쉼표로 구분된 여러 정답 처리
        return Arrays.stream(correctMeaning.split(","))
                .map(String::trim)
                .anyMatch(answer -> answer.equalsIgnoreCase(userAnswer.trim()));
    }

    public List<EnglishWord> findRandom5Words() {
        List<EnglishWord> randomWords = wordMapper.findRandom5Words();
        if (randomWords.isEmpty()) {
            throw new WordNotFoundException(0L);
        }
        return randomWords;
    }

    /**
     * @apiNote 전체 단어 목록을 조회합니다.
     * // 예를 들어 다음과 같은 상황이라면:
     * List<EnglishWord> words = ["단어1", "단어2", "단어3"]; // 현재 페이지 데이터
     * Pageable pageable = PageRequest.of(0, 3); // 0페이지, 페이지당 3개
     * long total = 10; // 전체 데이터 10개
     * <p>
     * Page<EnglishWord> page = new PageImpl<>(words, pageable, total);
     * <p>
     * // 이제 다음 정보들을 얻을 수 있습니다:
     * page.getTotalPages(); // 4 (전체 페이지 수)
     * page.isFirst(); // true (첫 페이지인가?)
     * page.isLast(); // false (마지막 페이지인가?)
     * page.hasNext(); // true (다음 페이지가 있는가?)
     * page.hasPrevious(); // false (이전 페이지가 있는가?)
     */
    @Transactional
    public Page<EnglishWord> findAllWords(Pageable pageable) {
        long total = wordMapper.countTotal();
        List<EnglishWord> words = wordMapper.findAllWithPaging(pageable);
        return new PageImpl<>(words, pageable, total);
    }
}
