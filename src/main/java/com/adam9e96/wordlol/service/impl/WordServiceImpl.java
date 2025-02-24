package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.dto.WordRequest;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.word.WordCreationException;
import com.adam9e96.wordlol.exception.word.WordDeletionException;
import com.adam9e96.wordlol.exception.word.WordNotFoundException;
import com.adam9e96.wordlol.exception.word.WordUpdateException;
import com.adam9e96.wordlol.mapper.WordMapper;
import com.adam9e96.wordlol.repository.WordRepository;
import com.adam9e96.wordlol.service.interfaces.WordService;
import com.adam9e96.wordlol.validator.WordValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
@Slf4j
@RequiredArgsConstructor
public class WordServiceImpl implements WordService {
    private final WordRepository wordRepository;
    private final WordMapper wordMapper;
    private final WordValidator wordValidator;
    private final Random random = new Random();

    // Public 인터페이스 구현
    @Override
    public void createWord(WordRequest request) {
        try {
            // 1. 입력값 검증
            wordValidator.validate(request);
            // 2. 중복 단어 검사
            if (isDuplicateWord(request.vocabulary())) {
                throw new ValidationException("이미 존재하는 단어입니다: " + request.vocabulary());
            }
            // 3. 엔티티 생성
            Word word = Word.builder()
                    .vocabulary(request.vocabulary())
                    .meaning(request.meaning())
                    .hint(request.hint())
                    .difficulty(request.difficulty())
                    .build();
            // 4. DB에 저장
            wordMapper.save(word);
        } catch (ValidationException e) {
            throw e;
        } catch (Exception e) {
            // DB 저장 실패 등의 문제 발생 시
            log.error("단어 생성 중 오류가 발생: {}", e.getMessage(), e);
            throw new WordCreationException(0L);  // 신규 생성이므로 임시 ID 0 사용
        }
    }

    @Transactional
    @Override
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
                createWord(request);
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

    @Override
    public Word findById(Long id) {
        return wordMapper.findById(id)
                .orElseThrow(() -> new WordNotFoundException(id));
    }

    @Transactional
    @Override
    public void updateWord(Long id, WordRequest request) {
        // 1. 기존 단어 존재 여부 확인
        Word word = wordMapper.findById(id).orElseThrow(() -> new WordNotFoundException(id));
        // 2. 비즈니스 로직 유효성 검증
        validateUpdateWordInput(request.vocabulary(), request.meaning(), request.hint(), request.difficulty());
        try {
            // 3. 단어 업데이트
            word.update(request.vocabulary(), request.meaning(), request.hint(), request.difficulty());
            wordMapper.save(word);
        } catch (Exception e) {
            log.error("단어 업데이트 중 오류가 발생했습니다. ID: {}", id, e);
            throw new WordUpdateException(id);
        }
    }

    @Override
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
    @Override
    public Page<Word> findAllWithPaging(Pageable pageable) {
        long total = wordMapper.countTotal();
        List<Word> words = wordMapper.findAllWithPaging(pageable);
        return new PageImpl<>(words, pageable, total);
    }

    @Override
    public Word findRandomWord() {
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
    @Override
    public Boolean validateAnswer(Long id, String userAnswer) {
        // 1. 단어 조회
        Word word = findById(id);
        log.info("정답: {}, 사용자 입력: {}", word.getMeaning(), userAnswer);
        // 2. 정답 확인
        return validateAnswer(word.getMeaning(), userAnswer);
    }

    @Override
    public List<Word> findRandomWords() {
        List<Word> randomWords = wordMapper.findRandom5Words();
        if (randomWords.isEmpty()) {
            throw new WordNotFoundException(0L);
        }
        return randomWords;
    }

    @Override
    public boolean checkVocabularyDuplicate(String vocabulary, Long excludeId) {
        if (excludeId != null) {
            // 수정 시: 자기 자신을 제외한 중복 체크
            return wordRepository.existsByVocabularyIgnoreCaseAndIdNot(vocabulary, excludeId);
        }
        // 신규 등록 시: 전체 중복 체크
        return wordRepository.existsByVocabularyIgnoreCase(vocabulary);
    }


    // Private 메서드
    private boolean isDuplicateWord(String vocabulary) {
        // 대소문자 구분 없이 중복 확인
        return wordRepository.existsByVocabularyIgnoreCase(vocabulary);
    }

    private void validateUpdateWordInput(String vocabulary, String meaning, String hint, Integer difficulty) {
        wordValidator.validateVocabulary(vocabulary);
        // 단어와 의미의 실제 길이 검증 (공백 제거 후)
        // 2. 단어와 의미의 길이 검증
        wordValidator.validateMeaning(meaning);
        // 3. 힌트 길이 추가 검증 (선택사항)
        wordValidator.validateHint(hint);
        // 4. 난이도 검증
        wordValidator.validateDifficulty(difficulty);
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
}
