package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.WordBookRequest;
import com.adam9e96.WordLOL.dto.WordBookResponse;
import com.adam9e96.WordLOL.dto.WordRequest;
import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.Category;
import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.entity.WordBook;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import com.adam9e96.WordLOL.repository.WordBookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class WordBookServiceTest {

    @Autowired
    private WordBookService wordBookService;

    @Autowired
    private WordBookRepository wordBookRepository;

    @Autowired
    private EnglishWordRepository englishWordRepository;

    private WordBookRequest testWordBookRequest;
    private WordBook savedWordBook;

    @BeforeEach
    void setUp() {
        // 테스트 데이터 준비
        WordRequest wordRequest = new WordRequest(
                "apple",
                "사과",
                "빨간 과일",
                3
        );

        testWordBookRequest = new WordBookRequest(
                "TOEIC 기초 단어",
                "토익 시험 준비를 위한 기초 단어장",
                Category.TOEIC,
                List.of(wordRequest)
        );

        // 테스트용 단어장 생성 및 저장
        WordBook wordBook = WordBook.createNewWordBook(
                "기존 단어장",
                "테스트용 기존 단어장",
                Category.TOEIC
        );

        EnglishWord word = EnglishWord.builder()
                .vocabulary("test")
                .meaning("테스트")
                .hint("시험")
                .difficulty(3)
                .build();

        wordBook.addWord(word);
        savedWordBook = wordBookRepository.save(wordBook);
    }

    @Test
    @DisplayName("단어장 생성 통합 테스트")
    void createWordBook() {
        // when
        WordBookResponse response = wordBookService.createWordBook(testWordBookRequest);

        // then
        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo(testWordBookRequest.name());
        assertThat(response.category()).isEqualTo(testWordBookRequest.category());

        // 실제 데이터베이스에서 저장된 데이터 확인
        WordBook savedBook = wordBookRepository.findById(response.id()).orElseThrow();
        assertThat(savedBook.getWords()).hasSize(1);
        assertThat(savedBook.getWords().get(0).getVocabulary()).isEqualTo("apple");
    }

    @Test
    @DisplayName("카테고리별 단어장 목록 조회 통합 테스트")
    void findWordBooksByCategory() {
        // when
        List<WordBookResponse> responses = wordBookService.findWordBooksByCategory(Category.TOEIC);

        // then
        assertThat(responses).isNotEmpty();
        assertThat(responses.get(0).category()).isEqualTo(Category.TOEIC);
    }

    @Test
    @DisplayName("전체 단어장 목록 조회 통합 테스트")
    void findAllWordBooks() {
        // when
        List<WordBookResponse> responses = wordBookService.findAllWordBooks();

        // then
        assertThat(responses).isNotEmpty();
        assertThat(responses).extracting(WordBookResponse::name)
                .contains(savedWordBook.getName());
    }

    @Test
    @DisplayName("단어장 ID로 단어 목록 조회 통합 테스트")
    void getWordsByWordBookId() {
        // given
        System.out.println("Saved WordBook ID: " + savedWordBook.getId());
        System.out.println("Words in saved WordBook: " + savedWordBook.getWords().size());
        // when
        List<WordResponse> responses = wordBookService.getWordsByWordBookId(savedWordBook.getId().intValue());

        // then
        assertThat(responses).isNotEmpty();
        assertThat(responses.getFirst().vocabulary()).isEqualTo("test");
    }

    @Test
    @DisplayName("카테고리별 단어 목록 조회 통합 테스트")
    void getWordsByCategory() {
        // when
        List<WordResponse> responses = wordBookService.getWordsByCategory(Category.TOEIC);

        // then
        assertThat(responses).isNotEmpty();
        assertThat(responses).extracting(WordResponse::vocabulary)
                .contains("test");
    }

    @Test
    @DisplayName("단어장의 단어 목록 페이징 조회 통합 테스트")
    void getWordsInBook() {
        // when
        Page<WordResponse> response = wordBookService.getWordsInBook(
                savedWordBook.getId(),
                PageRequest.of(0, 10)
        );

        // then
        assertThat(response.getContent()).isNotEmpty();
        assertThat(response.getContent().get(0).vocabulary()).isEqualTo("test");
    }

    @Test
    @DisplayName("존재하지 않는 단어장 조회시 예외 발생 통합 테스트")
    void getWordsInBookWithInvalidId() {
        // when & then
        assertThrows(IllegalArgumentException.class, () ->
                wordBookService.getWordsInBook(999L, PageRequest.of(0, 10))
        );
    }

    @Test
    @DisplayName("데이터베이스 상태 확인")
    void checkDatabaseState() {
        List<WordBook> allWordBooks = wordBookRepository.findAll();
        System.out.println("Total WordBooks: " + allWordBooks.size());

        for (WordBook wb : allWordBooks) {
            System.out.println("WordBook ID: " + wb.getId());
            System.out.println("Words count: " + wb.getWords().size());
        }

        List<EnglishWord> allWords = englishWordRepository.findAll();
        System.out.println("Total Words: " + allWords.size());
    }

}