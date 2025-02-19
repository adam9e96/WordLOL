package com.adam9e96.wordlol.service.impl;

import com.adam9e96.wordlol.dto.WordBookRequest;
import com.adam9e96.wordlol.dto.WordRequest;
import com.adam9e96.wordlol.entity.Category;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.entity.WordBook;
import com.adam9e96.wordlol.exception.wordbook.*;
import com.adam9e96.wordlol.mapper.WordBookMapper;
import com.adam9e96.wordlol.mapper.WordMapper;
import com.adam9e96.wordlol.repository.WordRepository;
import com.adam9e96.wordlol.repository.WordBookRepository;
import com.adam9e96.wordlol.service.interfaces.WordBookService;
import com.adam9e96.wordlol.validator.WordBookValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

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

    @Transactional
    @Override
    public WordBook createWordBook(WordBookRequest request) {
        try {
            // 입력값 유효성 검사
            wordBookValidator.validate(request);
            // 단어장 생성
            WordBook wordBook = WordBook.createNewWordBook(
                    request.name(),
                    request.description(),
                    request.category()
            );
            // 단어 추가
            if (request.words() != null && !request.words().isEmpty()) {
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
            return wordBookRepository.save(wordBook);
        } catch (DataIntegrityViolationException e) {
            log.error("단어장 생성 중 데이터 무결성 오류 발생", e);
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
    @Transactional
    @Override
    public List<Word> findWordsByWordBookId(Long wordBookId) {
        // 단어장의 존재 여부 먼저 확인
        if (!wordBookRepository.existsById(wordBookId)) {
            throw new WordBookNotFoundException(wordBookId);
        }
        try {
            return wordMapper.findByWordBookId(wordBookId);
        } catch (Exception e) {
            log.error("단어장 조회 중 예기치 않은 오류 발생", e);
            throw new WordBookNotFoundException(wordBookId);
        }

    }

    // 카테고리별 단어장 목록 조회
    @Override
    public List<WordBook> findWordBookListByCategory(Category category) {
        if (category == null) {
            log.error("카테고리 값이 null 입니다.");
            throw new IllegalArgumentException("카테고리를 입력해주세요.");
        }
        List<WordBook> wordBooks = wordBookMapper.findByCategory(category);

        if (wordBooks.isEmpty()) {
            log.error("해당 카테고리의 단어장이 존재하지 않습니다. category: {}", category);
            throw new WordBookNotFoundException(category);
        }
        return wordBooks;
    }


    /**
     * 모든 단어장 목록을 조회합니다.
     *
     * @return 단어장 목록
     * @throws WordBookEmptyException 단어장이 하나도 없는 경우
     */
    @Transactional
    @Override
    public List<WordBook> findAllWordBookList() {
        log.info("단어장 목록 조회 시작");
        List<WordBook> wordBooks = wordBookRepository.findAll();

        if (wordBooks.isEmpty()) {
            throw new WordBookEmptyException();
        }

        return wordBooks;
    }

    @Override
    public List<Word> findWordsByBookCategory(Category category) {
        return wordRepository.findByWordBookCategory(category);
    }


    @Transactional
    @Override
    public WordBook findWordBookById(Long id) {
        WordBook wordBook = wordBookMapper.findById(id);
        if (wordBook == null) {
            throw new WordBookNotFoundException(id);
        }
        return wordBook;
    }


    /**
     * 단어장의 학습용 단어 목록을 조회합니다.
     *
     * @param wordBookId 단어장 ID
     * @return 학습용 단어 목록
     * @throws WordBookNotFoundException 단어장이 존재하지 않는 경우
     */
    @Override
    public List<Word> findWordBookStudyData(Long wordBookId) {
        log.debug("단어장 학습 데이터 조회 시작 - wordBookId: {}", wordBookId);

        // 단어장 존재 여부 확인
        if (!wordBookRepository.existsById(wordBookId)) {
            log.error("단어장이 존재하지 않습니다. wordBookId: {}", wordBookId);
            throw new WordBookNotFoundException(wordBookId);
        }

        // 단어 목록 조회
        List<Word> words = wordMapper.findAllByWordBookId(wordBookId);

        if (words.isEmpty()) {
            log.error("단어장에 단어가 없습니다. wordBookId: {}", wordBookId);
            throw new WordBookEmptyException(wordBookId);
        }

        log.info("단어장 학습 데이터 조회 완료 - wordBookId: {}, 단어 수: {}",
                wordBookId, words.size());
        return words;
    }

    @Transactional
    @Override
    public WordBook updateWordBookById(Long id, WordBookRequest request) {
        log.info("단어장 수정 시작 - id: {}", id);
        // 유효성 검사
        wordBookValidator.validateUpdate(request, id);
        // 기존 단어장 조회
        WordBook wordBook = wordBookRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("수정할 단어장을 찾을 수 없습니다. id: {}", id);
                    return new WordBookNotFoundException(id);
                });
        try {
            // 기본 정보 업데이트
            wordBook.updateInfo(
                    request.name(),
                    request.description(),
                    request.category()
            );
            // 단어 목록 업데이트
            updateWordBookWords(wordBook, request.words());
            // 저장 및 반환
            WordBook savedWordBook = wordBookRepository.save(wordBook);
            log.info("단어장 수정 완료 - id: {}", id);
            return savedWordBook;
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
                    log.error("삭제할 단어장을 찾을 수 없습니다. id: {}", id);
                    return new WordBookNotFoundException(id);
                });

        try {
            wordBookRepository.delete(wordBook);
            log.info("단어장 삭제 완료 - id: {}", id);
        } catch (Exception e) {
            log.error("단어장 삭제 중 오류 발생 - id: {}", id, e);
            throw new WordBookDeletionException();
        }
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
