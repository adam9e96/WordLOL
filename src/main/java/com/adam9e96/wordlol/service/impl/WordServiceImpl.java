package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.common.constants.Constants;
import com.adam9e96.wordlol.dto.request.AnswerRequest;
import com.adam9e96.wordlol.dto.request.WordRequest;
import com.adam9e96.wordlol.dto.request.WordSearchRequest;
import com.adam9e96.wordlol.dto.response.*;
import com.adam9e96.wordlol.entity.StudyHistory;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.word.WordCreationException;
import com.adam9e96.wordlol.exception.word.WordDeletionException;
import com.adam9e96.wordlol.exception.word.WordNotFoundException;
import com.adam9e96.wordlol.mapper.entity.WordEntityMapper;
import com.adam9e96.wordlol.repository.jpa.StudyHistoryRepository;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import com.adam9e96.wordlol.repository.jpa.WordRepository;
import com.adam9e96.wordlol.repository.mybatis.WordMapper;
import com.adam9e96.wordlol.service.interfaces.StudyProgressService;
import com.adam9e96.wordlol.service.interfaces.WordService;
import com.adam9e96.wordlol.validator.WordValidator;
import jakarta.servlet.http.HttpSession;
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
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class WordServiceImpl implements WordService {
    private final WordRepository wordRepository;
    private final WordMapper wordMapper;
    private final WordValidator wordValidator;
    private final WordEntityMapper wordEntityMapper;
    private final UserRepository userRepository;
    private final StudyHistoryRepository studyHistoryRepository;
    private final StudyProgressService studyProgressService;

    /**
     * 단어를 생성하고 결과를 DTO 로 반환합니다.
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
            User currentUser = getCurrentUser();

            // 4. 단어 엔티티 생성
            Word word = Word.builder()
                    .vocabulary(request.vocabulary())
                    .meaning(request.meaning())
                    .hint(request.hint())
                    .difficulty(request.difficulty())
                    .user(currentUser)
                    .build();

            // 5. 데이터베이스에 저장
            wordMapper.save(word);

            // 6. 응답 DTO 로 변환하여 반환
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
        User currentUser = getCurrentUser();

        Word word = wordMapper.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new WordNotFoundException(id));

        return wordEntityMapper.toDto(word);
    }

    @Transactional
    @Override
    public void updateWord(Long id, WordRequest request) {
        wordValidator.validate(request);

        User currentUser = getCurrentUser();

        // 3. 단어 조회 및 소유권 검증 (한 번에 처리)
        Word word = wordMapper.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new WordNotFoundException(id));

        // 4. 중복 검증
        if (!word.getVocabulary().equals(request.vocabulary()) &&
                checkVocabularyDuplicate(request.vocabulary(), id)) {
            throw new ValidationException(Constants.Validation.EXISTS_VOCABULARY_MESSAGE + request.vocabulary());
        }

        // 5. 단어 업데이트
        word.update(request.vocabulary(), request.meaning(), request.hint(), request.difficulty());

        // 6. DB 저장
        wordMapper.update(word);
    }

    @Override
    public void deleteWord(Long id) {
        // 1. 사용자 조회
        User currentUser = getCurrentUser();

        // 2. 단어 조회 및 소유권 검증
        Word word = wordMapper.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new WordNotFoundException(id));

        try {
            // 3. 단어 삭제
            wordMapper.deleteById(id);
            log.info("단어 삭제 완료 - ID: {}, 단어: {}", id, word.getVocabulary());
        } catch (Exception e) {
            log.error("단어 삭제 중 오류 발생: {}", e.getMessage(), e);
            throw new WordDeletionException(id);
        }
    }

    /**
     * 현재 로그인한 사용자의 단어 목록을 페이징하여 조회합니다.
     *
     * @param pageable 페이징 정보 (페이지 번호, 페이지 크기, 정렬 정보 등)
     * @return 페이징 처리된 단어 목록
     * <p>
     * <예시>
     * 다음과 같은 상황일 때:
     * - 사용자의 전체 단어 수: 100개
     * - pageable: PageRequest.of(0, 10, Sort.by("id").descending()) - 첫 페이지, 페이지당 10개, ID 내림차순
     * <p>
     * 결과:
     * - page.getContent(): 최근 등록된 10개 단어 목록
     * - page.getTotalElements(): 100 (전체 단어 수)
     * - page.getTotalPages(): 10 (전체 페이지 수)
     * - page.getNumber(): 0 (현재 페이지 번호, 0부터 시작)
     * - page.getSize(): 10 (페이지 크기)
     * - page.isFirst(): true (첫 페이지인지 여부)
     * - page.isLast(): false (마지막 페이지인지 여부)
     * - page.hasNext(): true (다음 페이지가 있는지 여부)
     * - page.hasPrevious(): false (이전 페이지가 있는지 여부)
     */
    @Transactional
    @Override
    public Page<Word> findAllWithPaging(Pageable pageable) {
        User user = getCurrentUser();

        // 1. 현재 사용자의 총 단어 수 계산
        long total = wordMapper.countByUser(user.getId());

        // 2. 페이징 처리된 현재 사용자의 단어 목록 가져오기
        List<Word> words = wordMapper.findByUserWithPaging(user.getId(), pageable);

        // 3. 페이징된 결과 반환
        return new PageImpl<>(words, pageable, total);
    }

    @Override
    public WordStudyResponse findRandomWord() {
        try {
            // 1. 현재 인증된 사용자 정보 가져오기
            User currentUser = getCurrentUser();
            // 2. 현재 사용자의 총 단어 수 확인
            long totalUserWords = wordMapper.countByUser(currentUser.getId());
            if (totalUserWords == 0) {
                log.warn("사용자({})의 등록된 단어가 없습니다.", currentUser.getEmail());
                throw new WordNotFoundException(0L);
            }
            // 3. 랜덤 단어 조회 시 사용자 ID를 파라미터로 전달하는 메서드 호출
            Word randomWord = wordMapper.findRandomWordByUserId(currentUser.getId());

            // 4. 결과가 null 인 경우
            if (randomWord == null) {
                log.warn("사용자({})의 랜덤 단어 조회 실패", currentUser.getEmail());
                throw new WordNotFoundException(0L);
            }

            // 6. 응답 DTO 반환
            return wordEntityMapper.toStudyDto(randomWord);
        } catch (Exception e) {
            log.error("랜덤 단어 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new WordNotFoundException(0L);
        }
    }

    @Override
    public AnswerResponse checkAnswer(AnswerRequest answerRequest, HttpSession session) {
        // 1. 단어 ID와 사용자 답안으로 정답 여부 확인
        boolean isCorrect = validateAnswer(answerRequest.wordId(), answerRequest.answer());

        // 2. 현재 인증된 사용자 정보 가져오기
        User currentUser = getCurrentUser();

        // 3. 단어 정보 조회
        Word word = wordRepository.findById(answerRequest.wordId())
                .orElseThrow(() -> new WordNotFoundException(answerRequest.wordId()));

        // 4. 학습 기록 저장 (정답 여부 포함)
        updateUserWordStudyHistory(currentUser, word, isCorrect);

        AnswerResponse response;
        String sessionId = session.getId();

        if (isCorrect) {
            int newPerfectRun = studyProgressService.incrementPerfectRun(sessionId);
            response = new AnswerResponse(true, "정답입니다!", newPerfectRun);
        } else {
            studyProgressService.resetPerfectRun(sessionId);
            response = new AnswerResponse(false, "틀렸습니다. 다시 시도해보세요.", 0);
        }
        return response;
    }

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
        try {
            // 현재 인증된 사용자 가져오기
            User currentUser = getCurrentUser();

            // 사용자가 충분한 단어를 가지고 있는지 확인
            long totalUserWords = wordMapper.countByUser(currentUser.getId());

            List<Word> randomWords;

            if (totalUserWords >= 5) {
                // 사용자의 단어가 5개 이상인 경우 해당 사용자의 단어 중에서 랜덤 선택
                randomWords = wordMapper.findRandomWordsByUserId(currentUser.getId(), 5);
            } else if (totalUserWords > 0) {
                // 사용자의 단어가 5개 미만이지만 존재하는 경우 가진 만큼 가져옴
                randomWords = wordMapper.findRandomWordsByUserId(currentUser.getId(), (int) totalUserWords);
            } else {
                // 사용자의 단어가 없는 경우 공용 랜덤 단어 사용 (기존 방식)
                randomWords = wordMapper.findRandom5Words();
            }

            if (randomWords.isEmpty()) {
                log.warn("단어를 찾을 수 없습니다.");
                throw new WordNotFoundException(0L);
            }
            return wordEntityMapper.toDailyWordDtoList(randomWords);
        } catch (Exception e) {
            log.error("일일 단어 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new WordNotFoundException(0L);
        }
    }

    @Override
    public boolean checkVocabularyDuplicate(String newVocabulary, Long excludeId) {
        User currentUser = getCurrentUser();

        if (excludeId != null) {
            // 수정 시: 자기 자신을 제외한 중복 체크
            return wordRepository.existsByVocabularyIgnoreCaseAndUserAndIdNot(newVocabulary, currentUser, excludeId);
        }
        // 신규 등록 시: 현재 사용자의 단어 중에서만 중복 체크
        return wordRepository.existsByVocabularyIgnoreCaseAndUser(newVocabulary, currentUser);
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

    // 사용자의 단어 학습 이력을 기록하기 위한 메서드
    private void updateUserWordStudyHistory(User user, Word word, boolean isCorrect) {
        // 객체 생성 후 저장 (setter 없이)
        StudyHistory studyHistory = StudyHistory.createStudyRecord(user, word, isCorrect);
        studyHistoryRepository.save(studyHistory);
    }

    // 일괄 저장을 위한 새로운 private 메서드
    private void batchSaveWords(List<Word> words) {
        wordMapper.batchSave(words);
    }

    private boolean isDuplicateWord(String vocabulary) {
        // 현재 사용자 가져오기
        User currentUser = getCurrentUser();

        // 현재 사용자의 단어 중에서만 중복 체크
        return wordRepository.existsByVocabularyIgnoreCaseAndUser(vocabulary, currentUser);
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


    /**
     * 현재 로그인한 사용자를 가져옵니다.
     *
     * @return 현재 인증된 사용자
     * @throws RuntimeException 인증된 사용자를 찾을 수 없는 경우
     */
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("인증된 사용자를 찾을 수 없습니다."));
    }

    @Override
    public WordHintResponse getWordHint(Long id) {
        Optional<Word> optionalWord = wordMapper.findWordByHint(id);
        if (optionalWord.isPresent()) {
            Word word = optionalWord.get();
//            return new WordHintResponse(word.getHint());
            return wordEntityMapper.toHintDto(word);
        } else {
            throw new WordNotFoundException(id);
        }
    }
}
