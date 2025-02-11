package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.WordBookRequest;
import com.adam9e96.WordLOL.dto.WordRequest;
import com.adam9e96.WordLOL.entity.Category;
import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.entity.WordBook;
import com.adam9e96.WordLOL.mapper.WordMapper;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import com.adam9e96.WordLOL.repository.WordBookRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@Service
@Transactional
@RequiredArgsConstructor
public class WordBookService {
    private final WordBookRepository wordBookRepository;
    private final EnglishWordService englishWordService;
    private final EnglishWordRepository englishWordRepository;
    private final WordMapper wordMapper;

    @Transactional
    public WordBook createWordBook(WordBookRequest request) {
        // 단어장 생성 (정적 팩토리 메서드 사용)
        WordBook wordBook = WordBook.createNewWordBook(
                request.name(),
                request.description(),
                request.category()
        );

        // 단어들을 생성하고 단어장과 연결
        for (WordRequest wordRequest : request.words()) {
            EnglishWord word = EnglishWord.builder()
                    .vocabulary(wordRequest.vocabulary())
                    .meaning(wordRequest.meaning())
                    .hint(wordRequest.hint())
                    .difficulty(wordRequest.difficulty())
                    .build();
            wordBook.addWord(word);
        }

        // 단어장 저장 (cascade로 단어들도 함께 저장됨)
        return wordBookRepository.save(wordBook);
    }


//    public Page<WordBook> getWordsInBook(Long bookId, Pageable pageable) {
//        WordBook wordBook = wordBookRepository.findById(bookId)
//                .orElseThrow(() -> new IllegalArgumentException("단어장을 찾을 수 없습니다."));
//
//        return englishWordService.findWordsByBookId(bookId, pageable);

    /// /        return englishWordService.findWordsByBookId(bookId, pageable).map(this::convertToWordDTO);
//    }

    // 카테고리별 단어장 목록 조회
    public List<WordBook> findWordBooksByCategory(Category category) {
        return wordBookRepository.findByCategory(category);
    }

    public List<WordBook> findAllWordBooks() {
        return wordBookRepository.findAll();
    }

    public List<EnglishWord> getWordsByWordBookId(int wordBookId) {
        return wordMapper.findByWordBookId(wordBookId);
    }

    public List<EnglishWord> getWordsByCategory(Category category) {
        return englishWordRepository.findByWordBookCategory(category);
    }
    // ================================ //

    @Transactional
    public void deleteWordBook(Long wordBookId) {
        // 존재 여부 확인
        if (!wordBookRepository.existsById(wordBookId)) {
            throw new IllegalArgumentException("존재하지 않는 단어장입니다. id:" + id);
        }
        wordBookRepository.deleteById(wordBookId);
    }

    @Transactional
    public Optional<WordBook> findById(Long id) {
        return wordBookRepository.findById(id);
    }

    @Transactional
    public WordBook updateWordBook(Long id, WordBookRequest request) {
        WordBook wordBook = wordBookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("단어장을 찾을 수 없습니다."));

        // 기본 정보 업데이트
        wordBook.updateInfo(
                request.name(),
                request.description(),
                request.category()
        );


        // 기존 단어들을 Map으로 변환 (ID로 빠르게 조회하기 위해)
        Map<Long, EnglishWord> existingWords = wordBook.getWords().stream()
                .collect(Collectors.toMap(EnglishWord::getId, word -> word));

        // 새로운 단어 목록
        List<EnglishWord> updatedWords = new ArrayList<>();

        // 요청받은 단어들 처리
        for (WordRequest wordRequest : request.words()) {
            if (wordRequest.id() != null && existingWords.containsKey(wordRequest.id())) {
                // 기존 단어 업데이트
                EnglishWord existingWord = existingWords.get(wordRequest.id());
                existingWord.update(
                        wordRequest.vocabulary(),
                        wordRequest.meaning(),
                        wordRequest.hint(),
                        wordRequest.difficulty()
                );
                updatedWords.add(existingWord);
            } else {
                // 새 단어 추가
                EnglishWord newWord = EnglishWord.builder()
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

        return wordBookRepository.save(wordBook);
    }

}
