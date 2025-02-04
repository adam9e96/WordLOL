//package com.adam9e96.WordLOL.service;
//
//import com.adam9e96.WordLOL.dto.WordResponse;
//import com.adam9e96.WordLOL.entity.Category;
//import com.adam9e96.WordLOL.entity.EnglishWord;
//import com.adam9e96.WordLOL.entity.WordBook;
//import com.adam9e96.WordLOL.repository.EnglishWordRepository;
//import com.adam9e96.WordLOL.repository.WordBookRepository;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertFalse;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//
//@SpringBootTest
//@Transactional
//@ActiveProfiles("test")
//class EnglishWordServiceTest {
//
//    @Autowired
//    private EnglishWordService englishWordService;
//
//    @Autowired
//    private EnglishWordRepository englishWordRepository;
//
//    @Autowired
//    private WordBookRepository wordBookRepository;
//
//    private EnglishWord testWord;
//    private WordBook testWordBook;
//
//    @BeforeEach
//    void setUp() {
//        // 테스트용 단어장 생성
//        testWordBook = WordBook.createNewWordBook(
//                "Test WordBook",
//                "Test Description",
//                Category.TOEIC
//        );
//        wordBookRepository.save(testWordBook);
//
//        // 테스트용 단어 생성
//        testWord = EnglishWord.builder()
//                .vocabulary("test")
//                .meaning("테스트")
//                .hint("시험")
//                .difficulty(3)
//                .wordBook(testWordBook)
//                .build();
//        testWord = englishWordRepository.save(testWord);
//    }
//
//    @Test
//    @DisplayName("ID로 단어 조회 테스트")
//    void findById() {
//        // when
//        WordResponse response = englishWordService.findById(testWord.getId());
//
//        // then
//        assertThat(response).isNotNull();
//        assertThat(response.vocabulary()).isEqualTo("test");
//        assertThat(response.meaning()).isEqualTo("테스트");
//    }
//
//    @Test
//    @DisplayName("단어 추가 테스트")
//    void createWord() {
//        // when
//        englishWordService.createWord("apple", "사과", "빨간 과일", 2);
//
//        // then
//        List<EnglishWord> words = englishWordRepository.findAll();
//        EnglishWord savedWord = words.stream()
//                .filter(w -> w.getVocabulary().equals("apple"))
//                .findFirst()
//                .orElseThrow();
//
//        assertThat(savedWord.getMeaning()).isEqualTo("사과");
//        assertThat(savedWord.getDifficulty()).isEqualTo(2);
//    }
//
//    @Test
//    @DisplayName("단어 수정 테스트")
//    void updateWord() {
//        // when
//        englishWordService.updateWord(
//                testWord.getId(),
//                "updated",
//                "수정됨",
//                "수정된 힌트",
//                4
//        );
//
//        // then
//        EnglishWord updatedWord = englishWordRepository.findById(testWord.getId()).orElseThrow();
//        assertThat(updatedWord.getVocabulary()).isEqualTo("updated");
//        assertThat(updatedWord.getMeaning()).isEqualTo("수정됨");
//        assertThat(updatedWord.getDifficulty()).isEqualTo(4);
//    }
//
//    @Test
//    @DisplayName("단어 삭제 테스트")
//    void deleteWord() {
//        // when
//        englishWordService.deleteWord(testWord.getId());
//
//        // then
//        Optional<EnglishWord> deletedWord = englishWordRepository.findById(testWord.getId());
//        assertThat(deletedWord).isEmpty();
//    }
//
//    @Test
//    @DisplayName("전체 단어 수 조회 테스트")
//    void countAllWordList() {
//        // when
//        int count = englishWordService.countAllWordList();
//
//        // then
//        assertThat(count).isEqualTo(1); // setUp에서 생성한 단어 1개
//    }
//
//    @Test
//    @DisplayName("페이징 처리된 단어 목록 조회 테스트")
//    void findAllWordsWithPaging() {
//        // given
//        PageRequest pageRequest = PageRequest.of(0, 10);
//
//        // when
//        Page<WordResponse> wordPage = englishWordService.findAllWordsWithPaging(pageRequest);
//
//        // then
//        assertThat(wordPage.getContent()).hasSize(1);
//        assertThat(wordPage.getContent().get(0).vocabulary()).isEqualTo("test");
//    }
//
//    @Test
//    @DisplayName("랜덤 단어 조회 테스트")
//    void getRandomWord() {
//        // when
//        Optional<WordResponse> randomWord = englishWordService.getRandomWord();
//
//        // then
//        assertTrue(randomWord.isPresent());
//        assertThat(randomWord.get().vocabulary()).isEqualTo("test");
//    }
//
//    @Test
//    @DisplayName("정답 체크 테스트 - 정답인 경우")
//    void checkAnswer_Correct() {
//        // when
//        boolean result = englishWordService.checkAnswer(testWord.getId(), "테스트");
//
//        // then
//        assertTrue(result);
//    }
//
//    @Test
//    @DisplayName("정답 체크 테스트 - 오답인 경우")
//    void checkAnswer_Incorrect() {
//        // when
//        boolean result = englishWordService.checkAnswer(testWord.getId(), "wrong");
//
//        // then
//        assertFalse(result);
//    }
//
//    @Test
//    @DisplayName("단어장에 단어 추가 테스트")
//    void createWordToBook() {
//        // when
//        englishWordService.insertWordToBook(
//                "book",
//                "책",
//                "읽는 것",
//                2,
//                testWordBook
//        );
//
//        // then
//        List<EnglishWord> words = englishWordRepository.findByWordBookId(testWordBook.getId());
//        assertThat(words).hasSize(2); // 기존 1개 + 새로 추가된 1개
//
//        EnglishWord addedWord = words.stream()
//                .filter(w -> w.getVocabulary().equals("book"))
//                .findFirst()
//                .orElseThrow();
//
//        assertThat(addedWord.getMeaning()).isEqualTo("책");
//        assertThat(addedWord.getWordBook().getId()).isEqualTo(testWordBook.getId());
//    }
//
//    @Test
//    @DisplayName("단어장 ID로 단어 목록 조회 테스트")
//    void findWordsByBookId() {
//        // given
//        PageRequest pageRequest = PageRequest.of(0, 10);
//
//        // when
//        Page<WordResponse> wordPage = englishWordService.findWordsByBookId(testWordBook.getId(), pageRequest);
//
//        // then
//        assertThat(wordPage.getContent()).hasSize(1);
//        assertThat(wordPage.getContent().get(0).vocabulary()).isEqualTo("test");
//    }
//}
