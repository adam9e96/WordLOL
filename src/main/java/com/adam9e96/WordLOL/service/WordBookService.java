package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.WordBookRequest;
import com.adam9e96.WordLOL.dto.WordBookResponse;
import com.adam9e96.WordLOL.dto.WordRequest;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.Category;
import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.entity.WordBook;
import com.adam9e96.WordLOL.mapper.WordMapper;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import com.adam9e96.WordLOL.repository.WordBookRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class WordBookService {
    private final WordBookRepository wordBookRepository;
    private final EnglishWordService englishWordService;
    private final EnglishWordRepository englishWordRepository;
    private final WordMapper wordMapper;

    @Transactional
    public WordBookResponse createWordBook(WordBookRequest request) {
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
        WordBook savedWordBook = wordBookRepository.save(wordBook);
        return convertToDTO(savedWordBook);
    }


    public Page<WordResponse> getWordsInBook(Long bookId, Pageable pageable) {
        WordBook wordBook = wordBookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("단어장을 찾을 수 없습니다."));

        return englishWordService.findWordsByBookId(bookId, pageable);
    }

    // 카테고리별 단어장 목록 조회
    public List<WordBookResponse> findWordBooksByCategory(Category category) {
        return wordBookRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<WordBookResponse> findAllWordBooks() {
        return wordBookRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    private WordBookResponse convertToDTO(WordBook wordBook) {
        return new WordBookResponse(
                wordBook.getId(),
                wordBook.getName(),
                wordBook.getDescription(),
                wordBook.getCategory(),
                wordBook.getWords().size(),  // 단어 수
                wordBook.getCreatedAt()
        );
    }

    public List<WordResponse> getWordsByWordBookId(int wordBookId) {
//        return englishWordRepository.findByWordBookId(wordBookId).stream()

        return wordMapper.findByWordBookId(wordBookId).stream()
                .map(this::convertToWordDTO)
                .collect(Collectors.toList());
    }

    public List<WordResponse> getWordsByCategory(Category category) {
        return englishWordRepository.findByWordBook_Category(category).stream()
                .map(this::convertToWordDTO)
                .collect(Collectors.toList());
    }

    private WordResponse convertToWordDTO(EnglishWord word) {
        return new WordResponse(
                word.getId(),
                word.getVocabulary(),
                word.getMeaning(),
                word.getHint(),
                word.getDifficulty(),
                word.getCreatedAt(),
                word.getUpdatedAt()
        );
    }

    // 또는 보안을 위해 특정 필드를 제외하고 싶다면:
    private WordResponse convertToWordDTOWithoutAnswer(EnglishWord word) {
        return new WordResponse(
                word.getId(),
                word.getVocabulary(),
                null,  // 정답은 숨김
                null,  // 힌트도 숨김
                word.getDifficulty(),
                word.getCreatedAt(),
                word.getUpdatedAt()
        );
    }

}
