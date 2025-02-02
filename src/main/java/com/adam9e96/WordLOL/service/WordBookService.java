package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.WordBookRequest;
import com.adam9e96.WordLOL.dto.WordBookResponse;
import com.adam9e96.WordLOL.dto.WordRequest;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.Category;
import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.entity.WordBook;
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

    @Transactional
    public WordBookResponse createWordBook(WordBookRequest request) {
        WordBook wordBook = WordBook.builder()
                .name(request.name())
                .description(request.description())
                .category(request.category())
                .build();

        // 단어들을 생성하고 단어장과 연결
        for (WordRequest wordRequest : request.words()) {
            EnglishWord word = EnglishWord.builder()
                    .vocabulary(wordRequest.vocabulary())
                    .meaning(wordRequest.meaning())
                    .hint(wordRequest.hint())
                    .difficulty(wordRequest.difficulty())
                    .build();
            wordBook.addWord(word);  // 수정된 부분
        }

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

    // 단어장 목록 조회 (페이징)
    public Page<WordBookResponse> findAllWordBooks(Pageable pageable) {
        return wordBookRepository.findAll(pageable)
                .map(this::convertToDTO);
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
}
