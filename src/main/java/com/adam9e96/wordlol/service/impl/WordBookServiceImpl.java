package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.dto.request.WordRequest;
import com.adam9e96.wordlol.dto.response.WordResponse;
import com.adam9e96.wordlol.dto.request.WordBookRequest;
import com.adam9e96.wordlol.dto.response.WordBookDetailResponse;
import com.adam9e96.wordlol.dto.response.WordBookListResponse;
import com.adam9e96.wordlol.dto.response.WordBookResponse;
import com.adam9e96.wordlol.dto.response.WordBookStudyResponse;
import com.adam9e96.wordlol.enums.Category;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.entity.WordBook;
import com.adam9e96.wordlol.exception.wordbook.*;
import com.adam9e96.wordlol.repository.mybatis.WordBookMapper;
import com.adam9e96.wordlol.repository.mybatis.WordMapper;
import com.adam9e96.wordlol.mapper.entity.WordBookEntityMapper;
import com.adam9e96.wordlol.mapper.entity.WordEntityMapper;
import com.adam9e96.wordlol.repository.jpa.WordBookRepository;
import com.adam9e96.wordlol.repository.jpa.WordRepository;
import com.adam9e96.wordlol.service.interfaces.WordBookService;
import com.adam9e96.wordlol.validator.WordBookValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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

    @Transactional
    @Override
    public WordBookResponse createWordBook(WordBookRequest request) {
        try {
            // 입력값 유효성 검사
            wordBookValidator.validate(request);

            // 단어장 생성 (로깅은 debug 레벨로)
            log.debug("단어장 생성 시작: 이름={}, 카테고리={}, 설명={}", request.name(), request.category(), request.description());

            // 단어장 생성
            WordBook wordBook = WordBook.createWordBook(
                    request.name(),
                    request.description(),
                    request.category()
            );

            // 단어 추가
            if (request.words() != null && !request.words().isEmpty()) {
                log.debug("단어장에 {}개의 단어 추가 시작", request.words().size());

                for (WordRequest wordRequest : request.words()) {
                    Word word = Word.builder()
                            .vocabulary(wordRequest.vocabulary())
                            .meaning(wordRequest.meaning())
                            .hint(wordRequest.hint())
                            .difficulty(wordRequest.difficulty())
                            .build();
                    wordBook.addWord(word);
                }
            }
            WordBook savedWordBook = wordBookRepository.save(wordBook);
            log.debug("단어장 생성 완료: ID={}", savedWordBook.getId());

            // 단어장 생성 후 단어 목록을 WordResponse로 변환
            return wordBookEntityMapper.toResponse(savedWordBook);
        } catch (DataIntegrityViolationException e) {
            log.debug("단어장 생성 중 데이터 무결성 오류 : {}", e.getMessage());
            throw new WordBookCreationException();
        } catch (Exception e) {
            log.error("단어장 생성 중 예기치 않은 오류 발생", e);
            throw new WordBookCreationException();
        }
    }

    /**
     * 단어장에 포함된 모든 단어를 조회합니다.
     *
     * @param wordBookId 조회할 단어장의 ID
     * @return 단어장에 포함된 단어 목록
     * @throws WordBookNotFoundException 단어장이 존재하지 않는 경우
     */
    @Transactional(readOnly = true)
    @Override
    public List<WordResponse> findWordsByWordBookId(Long wordBookId) {
        try {
            // 먼저 단어장 존재 여부 확인
            if (!isWordBookExists(wordBookId)) {
                throw new WordBookNotFoundException(wordBookId);
            }

            // 단어 목록 조회
            List<Word> words = wordMapper.findByWordBookId(wordBookId);

            // 단어장은 존재하지만 단어가 없는 경우
            if (words.isEmpty()) {
                throw new WordBookEmptyWordsException(wordBookId);
            }

            // 단어 목록을 WordResponse 로 변환
            return words.stream()
                    .map(wordEntityMapper::toDto)
                    .toList();
        } catch (WordBookNotFoundException | WordBookEmptyWordsException e) {
            // 이미 생성된 예외는 그대로 전달
            throw e;
        } catch (Exception e) {
            log.error("단어장(ID: {})의 단어 목록 조회 중 오류 발생", wordBookId, e);
            throw new WordBookNotFoundException(wordBookId);
        }
    }


    /**
     * 카테고리별 단어장 목록을 조회합니다.
     *
     * @param category 조회할 카테고리
     * @return 해당 카테고리의 단어장 목록
     * @throws IllegalArgumentException  카테고리 값이 null인 경우
     * @throws WordBookNotFoundException 해당 카테고리의 단어장이 없는 경우
     */
    @Override
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 최적화
    public List<WordBookResponse> findWordBookListByCategory(Category category) {

        try {
            // 단어장 목록 조회
            List<WordBook> wordBooks = wordBookMapper.findByCategory(category);

            // 결과가 없는 경우 WordBookNotFoundException 발생
            if (wordBooks.isEmpty()) {
                log.info("카테고리 '{}'에 해당하는 단어장이 없습니다", category);
                throw new WordBookNotFoundException(category);
            }

            return wordBooks.stream()
                    .map(wordBookEntityMapper::toResponse)
                    .toList();
        } catch (Exception e) {
            log.error("카테고리 '{}'의 단어장 목록 조회 중 오류 발생", category, e);
            throw new WordBookNotFoundException(category);
        }
    }


    /**
     * 모든 단어장 목록을 조회합니다.
     *
     * @return 단어장 목록
     * @throws WordBookEmptyException 단어장이 하나도 없는 경우
     */
    @Transactional(readOnly = true)
    @Override
    public List<WordBookListResponse> findAllWordBookList() {
        try {
            List<WordBook> wordBooks = wordBookRepository.findAll();

            if (wordBooks.isEmpty()) {
                log.debug("등록된 단어장 없습니다");
                throw new WordBookEmptyException();
            }
            return wordBooks.stream()
                    .map(wordBookEntityMapper::toListDto)
                    .toList();

        } catch (Exception e) {
            log.error("단어장 목록 조회 중 오류 발생", e);
            throw new WordBookEmptyException();
        }

    }

    @Override
    public List<WordResponse> findWordsByBookCategory(Category category) {
        List<Word> words = wordRepository.findByWordBookCategory(category);
        return words.stream()
                .map(wordEntityMapper::toDto)
                .toList();
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

        // 단어장 존재 여부 확인
        if (!wordBookRepository.existsById(wordBookId)) {
            log.debug("단어장이 존재하지 않습니다. wordBookId: {}", wordBookId);
            throw new WordBookNotFoundException(wordBookId);
        }

        // 단어 목록 조회
        List<Word> words = wordMapper.findAllByWordBookId(wordBookId);

        if (words.isEmpty()) {
            log.debug("단어장에 단어가 없습니다. wordBookId: {}", wordBookId);
            throw new WordBookEmptyException(wordBookId);
        }

        log.debug("단어장 학습 데이터 조회 완료 - wordBookId: {}, 단어 수: {}",
                wordBookId, words.size());

        // 단어 목록 반환
        // 단어장에 속한 단어들만 반환
        return words.stream()
                .map(wordBookEntityMapper::toStudyDto)
                .toList();
    }

    @Transactional
    @Override
    public WordBookResponse updateWordBookById(Long id, WordBookRequest request) {
        log.info("단어장 수정 시작 - id: {}", id);
        // 유효성 검사
        wordBookValidator.validateUpdate(request, id);
        // 기존 단어장 조회
        WordBook wordBook = wordBookRepository.findById(id)
                .orElseThrow(() -> {
                    log.debug("수정할 단어장을 찾을 수 없습니다. id: {}", id);
                    return new WordBookNotFoundException(id);
                });
        try {
            // 기본 정보 업데이트
            wordBook.update(
                    request.name(),
                    request.description(),
                    request.category()
            );
            // 단어 목록 업데이트
            updateWordBookWords(wordBook, request.words());
            // 저장 및 반환
            WordBook savedWordBook = wordBookRepository.save(wordBook);
            log.debug("단어장 수정 완료 - id: {}", id);
            // 단어장 수정 후 단어 목록을 WordResponse로 변환
            return wordBookEntityMapper.toResponse(savedWordBook);

        } catch (Exception e) {
            log.error("단어장 수정 중 오류 발생 - id: {}", id, e);
            throw new WordBookUpdateException();
        }
    }


    @Override
    public void deleteWordBookById(Long id) {
        log.debug("단어장 삭제 시작 - id: {}", id);

        // 존재 여부 확인
        WordBook wordBook = wordBookRepository.findById(id)
                .orElseThrow(() -> {
                    log.debug("삭제할 단어장을 찾을 수 없습니다. id: {}", id);
                    return new WordBookNotFoundException(id);
                });

        try {
            wordBookRepository.delete(wordBook);
            log.debug("단어장 삭제 완료 - id: {}", id);
        } catch (Exception e) {
            log.error("단어장 삭제 중 오류 발생 - id: {}", id, e);
            throw new WordBookDeletionException();
        }
    }

    private boolean isWordBookExists(Long wordBookId) {
        return wordBookMapper.findById(wordBookId).isPresent();
    }

    private void updateWordBookWords(WordBook wordBook, List<WordRequest> wordRequests) {
        if (wordRequests == null || wordRequests.isEmpty()) {
            return;
        }

        // 기존 단어들을 Map으로 변환 (ID로 빠른 조회를 위해)
        Map<Long, Word> existingWords = wordBook.getWords().stream()
                .collect(Collectors.toMap(Word::getId, word -> word));

        // 새로운 단어 목록
        List<Word> updatedWords = new ArrayList<>();

        // 요청받은 단어들 처리
        for (WordRequest wordRequest : wordRequests) {
            if (wordRequest.id() != null && existingWords.containsKey(wordRequest.id())) {
                // 기존 단어 업데이트
                Word existingWord = existingWords.get(wordRequest.id());
                existingWord.update(
                        wordRequest.vocabulary(),
                        wordRequest.meaning(),
                        wordRequest.hint(),
                        wordRequest.difficulty()
                );
                updatedWords.add(existingWord);
            } else {
                // 새 단어 추가
                Word newWord = Word.builder()
                        .vocabulary(wordRequest.vocabulary())
                        .meaning(wordRequest.meaning())
                        .hint(wordRequest.hint())
                        .difficulty(wordRequest.difficulty())
                        .build();
                wordBook.addWord(newWord);
                updatedWords.add(newWord);
            }
        }

        // 단어장의 단어 목록 갱신
        wordBook.getWords().clear();
        wordBook.getWords().addAll(updatedWords);
    }


}
