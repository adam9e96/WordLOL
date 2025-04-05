package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.dto.request.WordBookRequest;
import com.adam9e96.wordlol.dto.request.WordRequest;
import com.adam9e96.wordlol.dto.response.*;
import com.adam9e96.wordlol.entity.User;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.entity.WordBook;
import com.adam9e96.wordlol.enums.Category;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.wordbook.*;
import com.adam9e96.wordlol.mapper.entity.WordBookEntityMapper;
import com.adam9e96.wordlol.mapper.entity.WordEntityMapper;
import com.adam9e96.wordlol.repository.jpa.UserRepository;
import com.adam9e96.wordlol.repository.jpa.WordBookRepository;
import com.adam9e96.wordlol.repository.jpa.WordRepository;
import com.adam9e96.wordlol.repository.mybatis.WordBookMapper;
import com.adam9e96.wordlol.repository.mybatis.WordMapper;
import com.adam9e96.wordlol.service.interfaces.WordBookService;
import com.adam9e96.wordlol.validator.WordBookValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class WordBookServiceImpl implements WordBookService {
    private final WordBookRepository wordBookRepository;
    private final WordRepository wordRepository;
    private final WordMapper wordMapper;
    private final WordBookMapper wordBookMapper;
    private final WordBookValidator wordBookValidator;
    private final WordBookEntityMapper wordBookEntityMapper;
    private final WordEntityMapper wordEntityMapper;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public WordBookResponse createWordBook(WordBookRequest request) {
        try {
            // 입력값 유효성 검사
            wordBookValidator.validate(request);

            // 현재 인증된 사용자 가져오기
            User currentUser = getCurrentAuthenticatedUser();

            // WordBook 엔티티 생성 (팩토리 메서드 사용)
            WordBook wordBook = WordBook.createWordBook(
                    request.name(),
                    request.description(),
                    request.category(),
                    currentUser
            );

            // 단어 추가 처리
            if (request.words() != null && !request.words().isEmpty()) {
                log.info("단어장에 {}개의 단어 추가 시작", request.words().size());

                for (WordRequest wordRequest : request.words()) {
                    try {
                        // WordBook의 팩토리 메서드를 사용하여 Word 생성 및 추가
                        // 이 방식은 setter 없이 관계를 설정
                        wordBook.createAndAddWord(
                                wordRequest.vocabulary(),
                                wordRequest.meaning(),
                                wordRequest.hint(),
                                wordRequest.difficulty(),
                                currentUser
                        );
                    } catch (ValidationException e) {
                        log.warn("유효하지 않은 단어 '{}' 건너뜀: {}",
                                wordRequest.vocabulary(), e.getMessage());
                        throw e;
                    }
                }
            } else {
                log.info("단어장이 비어있습니다");
            }

            // WordBook 저장 (연관된 Word 엔티티들도 cascade로 저장됨)
            WordBook savedWordBook = wordBookRepository.save(wordBook);
            log.info("단어장 생성 완료: ID={}, 이름={}", savedWordBook.getId(), savedWordBook.getName());

            // 응답 생성
            return wordBookEntityMapper.toResponse(savedWordBook);
        } catch (DataIntegrityViolationException e) {
            log.error("단어장 생성 중 데이터 무결성 오류: {}", e.getMessage());
            throw new WordBookCreationException();
        } catch (ValidationException e) {
            // 유효성 검사 예외는 그대로 전파
            throw e;
        } catch (Exception e) {
            log.error("단어장 생성 중 예기치 않은 오류 발생: {}", e.getMessage(), e);
            throw new WordBookCreationException();
        }
    }

    /**
     * 단어장에 포함된 모든 단어를 조회합니다.
     * 현재 인증된 사용자의 단어장만 조회합니다.
     *
     * @param wordBookId 조회할 단어장의 ID
     * @return 단어장에 포함된 단어 목록
     * @throws WordBookNotFoundException   단어장이 존재하지 않는 경우
     * @throws WordBookEmptyWordsException 단어장에 단어가 없는 경우
     */
    @Transactional(readOnly = true)
    @Override
    public List<WordResponse> findWordsByWordBookId(Long wordBookId) {
        try {
            // 현재 인증된 사용자 가져오기
            User currentUser = getCurrentAuthenticatedUser();
            Long userId = currentUser.getId();

            // 단어장 존재 여부 확인 (사용자 권한 체크를 위해 조회)
            WordBook wordBook = wordBookRepository.findById(wordBookId)
                    .orElseThrow(() -> new WordBookNotFoundException(wordBookId));

            validateUserAccess(wordBook, userId, wordBookId);

            // 단어 목록 조회 (현재 사용자의 ID도 함께 전달)
            List<Word> words = wordMapper.findByWordBookId(wordBookId, userId);

            // 단어장은 존재하지만 단어가 없는 경우
            if (words.isEmpty()) {
                throw new WordBookEmptyWordsException(wordBookId);
            }
            return wordEntityMapper.toDtoList(words);
        } catch (WordBookNotFoundException | WordBookEmptyWordsException e) {
            // 이미 생성된 예외는 그대로 전달
            throw e;
        } catch (Exception e) {
            log.error("단어장(ID: {})의 단어 목록 조회 중 오류 발생: {}", wordBookId, e.getMessage());
            throw new WordBookNotFoundException(wordBookId);
        }
    }

    /**
     * 카테고리별 단어장 목록을 조회합니다.
     * 현재 인증된 사용자의 단어장만 조회합니다.
     *
     * @param category 조회할 카테고리
     * @return 해당 카테고리의 단어장 목록
     * @throws IllegalArgumentException  카테고리 값이 null인 경우
     * @throws WordBookNotFoundException 해당 카테고리의 단어장이 없는 경우
     */
    @Override
    @Transactional(readOnly = true)
    public List<WordBookResponse> getWordBooksByCategory(Category category) {
        if (category == null) {
            throw new IllegalArgumentException("카테고리 값은 null일 수 없습니다");
        }
        try {
            User currentUser = getCurrentAuthenticatedUser();
            Long userId = currentUser.getId();

            // 현재 사용자의 특정 카테고리 단어장 목록 조회
            List<WordBook> wordBooks = wordBookMapper.findByCategory(category, userId);

            if (wordBooks.isEmpty()) {
                log.info("사용자 ID {}의 카테고리 '{}'에 해당하는 단어장이 없습니다", userId, category);
                throw new WordBookNotFoundException(category);
            }
            return wordBooks.stream()
                    .map(wordBookEntityMapper::toResponse)
                    .toList();
        } catch (WordBookNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("카테고리 '{}'의 단어장 목록 조회 중 오류 발생: {}", category, e.getMessage(), e);
            throw new WordBookNotFoundException(category);
        }
    }

    /**
     * 현재 인증된 사용자의 모든 단어장 목록을 조회합니다.
     *
     * @return 단어장 목록
     * @throws WordBookEmptyException 사용자의 단어장이 하나도 없는 경우
     */
    @Transactional(readOnly = true)
    @Override
    public List<WordBookListResponse> findAllWordBookList() {
        try {
            User currentUser = getCurrentAuthenticatedUser();
            Long userId = currentUser.getId();

            List<WordBook> wordBooks = wordBookRepository.findByUser(currentUser);

            if (wordBooks.isEmpty()) {
                log.info("사용자 ID {}의 등록된 단어장이 없습니다", userId);
                throw new WordBookEmptyException();
            }
            return wordBooks.stream()
                    .map(wordBookEntityMapper::toListDto)
                    .toList();
        } catch (WordBookEmptyException e) {
            throw e;
        } catch (Exception e) {
            log.error("단어장 목록 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new WordBookEmptyException();
        }
    }

    /**
     * 특정 카테고리에 속한 단어장의 모든 단어를 조회합니다.
     * 현재 인증된 사용자가 소유한 단어장의 단어만 조회합니다.
     *
     * @param category 조회할 카테고리
     * @return 해당 카테고리의 단어장에 포함된 단어 목록
     * @throws IllegalArgumentException 카테고리 값이 null인 경우
     */
    @Override
    @Transactional(readOnly = true)
    public List<WordResponse> getAllWordsFromWordBooksByCategory(Category category) {
        if (category == null) {
            throw new IllegalArgumentException("카테고리 값은 null일 수 없습니다");
        }

        try {
            // 현재 인증된 사용자 가져오기
            User currentUser = getCurrentAuthenticatedUser();

            log.debug("카테고리 '{}', 사용자 ID {}의 단어 조회 시작", category, currentUser.getId());

            // 현재 사용자의 단어장 중 특정 카테고리에 해당하는 단어 조회
            List<Word> words = wordRepository.findByWordBookCategoryAndWordBookUser(category, currentUser);

            if (words.isEmpty()) {
                log.info("사용자 ID {}의 카테고리 '{}'에 해당하는 단어가 없습니다", currentUser.getId(), category);
                return Collections.emptyList();
            }

            log.debug("카테고리 '{}', 사용자 ID {}의 단어 {}개 조회 완료",
                    category, currentUser.getId(), words.size());

            // 단어 목록을 DTO로 변환하여 반환
            return wordEntityMapper.toDtoList(words);
        } catch (Exception e) {
            log.error("카테고리 '{}'의 단어 목록 조회 중 오류 발생: {}", category, e.getMessage(), e);
            return Collections.emptyList(); // 오류 발생 시 빈 목록 반환
        }
    }


    @Transactional
    @Override
    public WordBookDetailResponse findWordBookById(Long id) {

        return wordBookEntityMapper.toDetailDto(wordBookRepository.findById(id)
                .orElseThrow(() -> {
                    log.debug("단어장(ID: {})을 찾을 수 없습니다", id);
                    return new WordBookNotFoundException(id);
                })
        );

    }

    /**
     * 단어장의 학습용 단어 목록을 조회합니다.
     *
     * @param wordBookId 단어장 ID
     * @return 학습용 단어 목록
     * @throws WordBookNotFoundException 단어장이 존재하지 않는 경우
     */
    @Override
    public List<WordBookStudyResponse> findWordBookStudyData(Long wordBookId) {
        User currentUser = getCurrentAuthenticatedUser();
        Long userId = currentUser.getId();

        // 소유권 확인을 위해 단어장 가져오기
        WordBook wordBook = wordBookRepository.findById(wordBookId)
                .orElseThrow(() -> {
                    log.debug("단어장이 존재하지 않습니다. wordBookId: {}", wordBookId);
                    return new WordBookNotFoundException(wordBookId);
                });

        // 현재 사용자가 이 단어장에 접근할 권한이 있는지 검증
        validateUserAccess(wordBook, userId, wordBookId);

        // 단어 목록 조회
        List<Word> words = wordMapper.findAllByWordBookId(wordBookId);

        if (words.isEmpty()) {
            log.debug("단어장에 단어가 없습니다. wordBookId: {}", wordBookId);
            throw new WordBookEmptyException(wordBookId);
        }
        return words.stream()
                .map(wordBookEntityMapper::toStudyDto)
                .toList();
    }

    @Transactional
    @Override
    public WordBookResponse updateWordBookById(Long id, WordBookRequest request) {
        wordBookValidator.validateUpdate(request, id);

        User currentUser = getCurrentAuthenticatedUser();
        Long userId = currentUser.getId();

        // 기존 단어장 조회
        WordBook wordBook = wordBookRepository.findById(id)
                .orElseThrow(() -> {
                    log.debug("수정할 단어장을 찾을 수 없습니다. id: {}", id);
                    return new WordBookNotFoundException(id);
                });

        validateUserAccess(wordBook, userId, id);

        try {
            wordBook.update(
                    request.name(),
                    request.description(),
                    request.category()
            );

            updateWordBookWords(wordBook, request.words());
            WordBook savedWordBook = wordBookRepository.save(wordBook);
            return wordBookEntityMapper.toResponse(savedWordBook);
        } catch (Exception e) {
            log.error("단어장 수정 중 오류 발생 - id: {}", id, e);
            throw new WordBookUpdateException();
        }
    }


    /**
     * 단어장을 삭제합니다.
     * 현재 인증된 사용자의 단어장만 삭제할 수 있습니다.
     *
     * @param id 삭제할 단어장의 ID
     * @throws WordBookNotFoundException 단어장이 존재하지 않는 경우
     * @throws WordBookDeletionException 단어장 삭제 중 오류가 발생한 경우
     * @throws AccessDeniedException     현재 사용자가 단어장의 소유자가 아닌 경우
     */
    @Override
    @Transactional
    public void deleteWordBookById(Long id) {
        try {
            User currentUser = getCurrentAuthenticatedUser();
            Long userId = currentUser.getId();

            // 단어장 조회
            WordBook wordBook = wordBookRepository.findById(id)
                    .orElseThrow(() -> {
                        log.debug("삭제할 단어장을 찾을 수 없습니다. id: {}", id);
                        return new WordBookNotFoundException(id);
                    });

            // 권한 확인: 사용자가 단어장의 소유자인지 확인
            if (!wordBook.getUser().getId().equals(userId)) {
                log.warn("사용자(ID: {})가 다른 사용자의 단어장(ID: {})을 삭제하려고 시도했습니다", userId, id);
                throw new AccessDeniedException("해당 단어장을 삭제할 권한이 없습니다");
            }

            // 단어장 및 연관된 단어 삭제 (cascade 설정에 따라 자동 처리)
            wordBookRepository.delete(wordBook);

            log.info("단어장 삭제 완료 - id: {}, 단어장 이름: {}, 단어 수: {}",
                    id, wordBook.getName(), wordBook.getWords().size());
        } catch (WordBookNotFoundException | AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            log.error("단어장 삭제 중 오류 발생 - id: {}, 오류: {}", id, e.getMessage(), e);
            throw new WordBookDeletionException();
        }
    }

    private void updateWordBookWords(WordBook wordBook, List<WordRequest> wordRequests) {
        if (wordRequests == null || wordRequests.isEmpty()) {
            return;
        }

        // 현재 인증된 사용자 가져오기 (단어 생성에 필요)
        User currentUser = getCurrentAuthenticatedUser();

        // 기존 단어들을 Map으로 변환 (ID로 빠른 조회를 위해)
        Map<Long, Word> existingWords = wordBook.getWords().stream()
                .collect(Collectors.toMap(Word::getId, word -> word));

        // 새로운 단어 목록
        List<Word> updatedWords = new ArrayList<>();

        // 요청받은 단어들 처리
        for (WordRequest wordRequest : wordRequests) {
            if (wordRequest.id() != null && existingWords.containsKey(wordRequest.id())) {
                // 기존 단어 업데이트 - 새 Word 객체를 생성하여 업데이트
                Word existingWord = existingWords.get(wordRequest.id());
                Word updatedWord = Word.builder()
                        .id(existingWord.getId())
                        .vocabulary(wordRequest.vocabulary())
                        .meaning(wordRequest.meaning())
                        .hint(wordRequest.hint())
                        .difficulty(wordRequest.difficulty())
                        .wordBook(wordBook)  // 관계 유지
                        .user(existingWord.getUser())
                        .build();

                updatedWords.add(updatedWord);
            } else {
                Word newWord = wordBook.createAndAddWord(
                        wordRequest.vocabulary(),
                        wordRequest.meaning(),
                        wordRequest.hint(),
                        wordRequest.difficulty(),
                        currentUser
                );

                updatedWords.add(newWord);
            }
        }

        // 단어장의 단어 목록 갱신
        wordBook.getWords().clear();
        wordBook.getWords().addAll(updatedWords);
    }

    private User getCurrentAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다. : " + email));
    }

    private void validateUserAccess(WordBook wordBook, Long userId, Long wordBookId) {
        if (!wordBook.getUser().getId().equals(userId)) {
            log.warn("사용자({})가 다른 사용자의 단어장({})에 접근 시도", userId, wordBookId);
            throw new WordBookNotFoundException(0L);
        }
    }
}
