package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.common.constants.Constants;
import com.adam9e96.wordlol.dto.request.WordRequest;
import com.adam9e96.wordlol.dto.request.WordSearchRequest;
import com.adam9e96.wordlol.dto.response.CreateWordResponse;
import com.adam9e96.wordlol.dto.response.DailyWordResponse;
import com.adam9e96.wordlol.dto.response.WordResponse;
import com.adam9e96.wordlol.dto.response.WordStudyResponse;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.word.WordCreationException;
import com.adam9e96.wordlol.exception.word.WordDeletionException;
import com.adam9e96.wordlol.exception.word.WordNotFoundException;
import com.adam9e96.wordlol.exception.word.WordUpdateException;
import com.adam9e96.wordlol.mapper.entity.WordEntityMapper;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import com.adam9e96.wordlol.repository.jpa.WordRepository;
import com.adam9e96.wordlol.repository.mybatis.WordMapper;
import com.adam9e96.wordlol.service.interfaces.WordService;
import com.adam9e96.wordlol.validator.WordValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class WordServiceImpl implements WordService {
    private final WordRepository wordRepository;
    private final WordMapper wordMapper;
    private final WordValidator wordValidator;
    private final WordEntityMapper wordEntityMapper;
    private final UserRepository userRepository;

    /**
     * 단어를 생성하고 결과를 DTO로 반환합니다.
     *
     * @param request 단어 생성 요청 데이터
     * @return 생성된 단어 정보를 담은 응답 DTO
     * @throws WordCreationException 단어 생성 중 오류 발생 시
     */
    @Override
    public CreateWordResponse createWord(WordRequest request) {
        try {
            // 1. 입력값 검증
            wordValidator.validate(request);

            // 2. 중복 단어 검사
            if (isDuplicateWord(request.vocabulary())) {
                throw new ValidationException(Constants.Validation.EXISTS_VOCABULARY_MESSAGE + request.vocabulary());
            }

            // 3. 현재 인증된 사용자 정보 조회
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("인증된 사용자를 찾을 수 없습니다."));

            // 4. 단어 엔티티 생성
            Word word = Word.builder()
                    .vocabulary(request.vocabulary())
                    .meaning(request.meaning())
                    .hint(request.hint())
                    .difficulty(request.difficulty())
                    .user(user)
                    .build();

            // 5. 데이터베이스에 저장
            wordMapper.save(word);

            // 6. 응답 DTO로 변환하여 반환
            return wordEntityMapper.toCreateDto(word);
        } catch (Exception e) {
            log.error("단어 생성 중 오류 발생: {}", e.getMessage(), e);
            throw new WordCreationException(0L);
        }
    }

    @Transactional
    @Override
    public int createWords(List<WordRequest> requests) {
        // 1. 요청이 없으면 0 반환
        if (requests == null || requests.isEmpty()) {
            return 0;
        }
        int successCount = 0;
        List<Word> wordsToSave = new ArrayList<>(requests.size());
        List<String> errors = new ArrayList<>();

        // 1. 모든 요청에 대해 검증 실행
        for (WordRequest request : requests) {
            try {
                // 입력값 검증
                wordValidator.validate(request);

                // 중복 단어 검사
                if (isDuplicateWord(request.vocabulary())) {
                    errors.add(Constants.Validation.EXISTS_VOCABULARY_MESSAGE + request.vocabulary());
                    continue;
                }
                // 엔티티 생성 및 목록에 추가
                Word word = Word.builder()
                        .vocabulary(request.vocabulary())
                        .meaning(request.meaning())
                        .hint(request.hint())
                        .difficulty(request.difficulty())
                        .build();

                wordsToSave.add(word);
                successCount++;
            } catch (ValidationException e) {
                errors.add(String.format("단어: %s, 오류: %s", request.vocabulary(), e.getMessage()));
            }
        }

        // 2. 유효한 단어가 있으면 한 번의 트랜잭션으로 일괄 저장
        if (!wordsToSave.isEmpty()) {
            try {
                batchSaveWords(wordsToSave);
            } catch (Exception e) {
                log.error("단어 일괄 저장 중 오류 발생: {}", e.getMessage(), e);
                throw new WordCreationException(0L);
            }
        }

        // 3. 오류가 있으면 로그에 기록
        if (!errors.isEmpty()) {
            log.warn("일부 단어 저장 실패: {}", String.join(", ", errors));
        }

        return successCount;
    }


    @Override
    public WordResponse findById(Long id) {
        Word word = wordMapper.findById(id).orElseThrow(() -> new WordNotFoundException(id));
        return wordEntityMapper.toDto(word);
    }

    @Transactional
    @Override
    public void updateWord(Long id, WordRequest request) {
        // 1. 입력값 검증 - 한번에 처리
        validateUpdateRequest(id, request);

        try {
            // 2. 단어 엔티티 조회 (없으면 예외 발생
            Word word = wordMapper.findById(id)
                    .orElseThrow(() -> new WordNotFoundException(id));

            // 3. 중복 검사 (자신을 제외한 다른 단어와 중복 체크)
            if (isVocabularyChangedAndDuplicate(word.getVocabulary(), request.vocabulary(), id)) {
                throw new ValidationException(Constants.Validation.EXISTS_VOCABULARY_MESSAGE + request.vocabulary());
            }

            // 4. 단어 업데이트
            word.update(request.vocabulary(), request.meaning(), request.hint(), request.difficulty());

            // 5. DB 저장
            wordMapper.update(word);
        } catch (WordNotFoundException | ValidationException e) {
            // 이미 적절한 예외이므로 그대로 전파
            throw e;
        } catch (Exception e) {
            log.error("단어 업데이트 중 오류 발생 [ID={}]: {}", id, e.getMessage(), e);
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
        // 현재 인증된 사용자 가져오기
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("현재 인증된 사용자를 찾을 수 없습니다."));

        // 1. 현재 사용자의 총 단어 수 계산
        long total = wordMapper.countByUser(user.getId());

        // 2. 페이징 처리된 현재 사용자의 단어 목록 가져오기
        List<Word> words = wordMapper.findByUserWithPaging(user.getId(), pageable);

        // 3. 페이징된 결과 반환
        return new PageImpl<>(words, pageable, total);
    }

    /**
     * 랜덤 단어를 조회합니다.
     * [OPTIMIZED] - 2025.03.05 완료
     */
    @Override
    public WordStudyResponse findRandomWord() {
        try {
            // 1. 단어 개수 확인 (선택적)
            long count = wordMapper.countAll();
            if (count == 0) {
                throw new WordNotFoundException(0L);
            }
            // 2. 데이터베이스에서 무작위 단어 조회
            Word randomWord = wordMapper.findRandomWord();

            // 3. 결과가 null 인 경우
            if (randomWord == null) {
                throw new WordNotFoundException(0L);
            }
            return wordEntityMapper.toStudyDto(randomWord);
//            return randomWord;
        } catch (Exception e) {
            log.error("랜덤 단어 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new WordNotFoundException(0L);
        }
    }

    // 답이 2개인경우 가능
    // 답안중에 중간에 띄어쓰기는 아직 안됨(띄어 쓰기도 포함해야 인정됨)
    @Override
    public Boolean validateAnswer(Long id, String userAnswer) {
        // 1. 단어 조회
        Word word = wordMapper.findById(id)
                .orElseThrow(() -> new WordNotFoundException(id));
        // 2. 정답 확인
        return validateAnswer(word.getMeaning(), userAnswer);
    }

    @Override
    public List<DailyWordResponse> findRandomWords() {
        List<Word> randomWords = wordMapper.findRandom5Words();
        if (randomWords.isEmpty()) {
            throw new WordNotFoundException(0L);
        }
        return wordEntityMapper.toDailyWordDtoList(randomWords);
    }

    @Override
    public boolean checkVocabularyDuplicate(String newVocabulary, Long excludeId) {
        if (excludeId != null) {
            // 수정 시: 자기 자신을 제외한 중복 체크
            return wordRepository.existsByVocabularyIgnoreCaseAndIdNot(newVocabulary, excludeId);
        }
        // 신규 등록 시: 전체 중복 체크
        return wordRepository.existsByVocabularyIgnoreCase(newVocabulary);
    }

    @Transactional
    @Override
    public Page<Word> searchWords(WordSearchRequest request, Pageable pageable) {
        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();
        String keyword = request.keyword();

        List<Word> words = wordMapper.searchWords(keyword, offset, limit);
        long total = wordMapper.countSearchResults(keyword);

        return new PageImpl<>(words, pageable, total);
    }


    // 일괄 저장을 위한 새로운 private 메서드
    private void batchSaveWords(List<Word> words) {
        // MyBatis를 사용하는 경우 배치 삽입 구현
        // 옵션 1: 단일 SQL로 여러 레코드 삽입 (권장)
        wordMapper.batchSave(words);

        // 옵션 2: 기존 단일 저장 메서드 재사용
        // for (Word word : words) {
        //     wordMapper.save(word);
        // }
    }

    // Private 메서드
    private boolean isDuplicateWord(String vocabulary) {
        // 대소문자 구분 없이 중복 확인
        return wordRepository.existsByVocabularyIgnoreCase(vocabulary);
    }

    /**
     * 단어(vocabulary)가 변경되었고 중복되는지 확인
     */
    private boolean isVocabularyChangedAndDuplicate(String originalVocabulary, String newVocabulary, Long wordId) {
        // 단어 변경이 없으면 중복 검사 불필요
        if (originalVocabulary.equals(newVocabulary)) {
            return false;
        }

        return checkVocabularyDuplicate(newVocabulary, wordId);
    }

    /**
     * 업데이트 요청 데이터 검증
     */
    private void validateUpdateRequest(Long id, WordRequest request) {
        if (id == null) {
            throw new ValidationException(Constants.Validation.EMPTY_ID_MESSAGE);
        }
        if (request == null) {
            throw new ValidationException(Constants.Validation.EMPTY_UPDATE_WORD_MESSAGE);
        }
        // WordValidator 를 통한 기본 유효성 검사
        wordValidator.validate(request);
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
