package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EnglishWordServiceTest {

    @Autowired
    private EnglishWordService englishWordService;

    @Autowired
    private EnglishWordRepository englishWordRepository;

    @Autowired
    private EntityManager entityManager;


    @Nested
    @DisplayName("createWord 메서드는")
    class CreateWord {

        @Test
        @DisplayName("올바른 입력값으로 단어를 생성한다")
        void createsWordWithValidInput() {
            // given
            String vocabulary = "book";
            String meaning = "책";
            String hint = "읽는 것";
            Integer difficulty = 1;

            // when
            englishWordService.createWord(vocabulary, meaning, hint, difficulty);
            entityManager.flush();
            entityManager.clear();

            // then
            Optional<EnglishWord> savedWord = englishWordRepository.findAll().stream()
                    .filter(word -> word.getVocabulary().equals(vocabulary))
                    .findFirst();

            assertThat(savedWord).isPresent();
            assertThat(savedWord.get())
                    .satisfies(word -> {
                        assertThat(word.getVocabulary()).isEqualTo(vocabulary);
                        assertThat(word.getMeaning()).isEqualTo(meaning);
                        assertThat(word.getHint()).isEqualTo(hint);
                        assertThat(word.getDifficulty()).isEqualTo(difficulty);
                        assertThat(word.getCreatedAt()).isNotNull();
                        assertThat(word.getUpdatedAt()).isNotNull();
                    });
        }

        @Test
        @DisplayName("힌트 없이도 단어를 생성한다")
        void createsWordWithoutHint() {
            // given
            String vocabulary = "pen";
            String meaning = "펜";
            Integer difficulty = 1;

            // when
            englishWordService.createWord(vocabulary, meaning, null, difficulty);
            entityManager.flush();
            entityManager.clear();

            // then
            Optional<EnglishWord> savedWord = englishWordRepository.findAll().stream()
                    .filter(word -> word.getVocabulary().equals(vocabulary))
                    .findFirst();

            assertThat(savedWord).isPresent();
            assertThat(savedWord.get())
                    .satisfies(word -> {
                        assertThat(word.getVocabulary()).isEqualTo(vocabulary);
                        assertThat(word.getMeaning()).isEqualTo(meaning);
                        assertThat(word.getHint()).isNull();
                        assertThat(word.getDifficulty()).isEqualTo(difficulty);
                    });
        }

        // 이건 나중에 막아야함 안되도록
        @Test
        @DisplayName("동일한 단어를 여러번 생성할 수 있다")
        void createsDuplicateWords() {
            // given
            String vocabulary = "test";
            String meaning = "테스트";
            String hint = "시험";
            Integer difficulty = 1;

            // when
            englishWordService.createWord(vocabulary, meaning, hint, difficulty);
            englishWordService.createWord(vocabulary, meaning, hint, difficulty);
            entityManager.flush();
            entityManager.clear();

            // then
            List<EnglishWord> savedWords = englishWordRepository.findAll().stream()
                    .filter(word -> word.getVocabulary().equals(vocabulary))
                    .toList();

            assertThat(savedWords).hasSize(2);
            assertThat(savedWords)
                    .allSatisfy(word -> {
                        assertThat(word.getVocabulary()).isEqualTo(vocabulary);
                        assertThat(word.getMeaning()).isEqualTo(meaning);
                        assertThat(word.getHint()).isEqualTo(hint);
                        assertThat(word.getDifficulty()).isEqualTo(difficulty);
                    });
        }
    }


    @Nested
    @DisplayName("findById 메서드는")
    class FindById {

        @Test
        @DisplayName("존재하는 ID로 조회하면 해당 단어를 반환한다")
        void returnsWordWhenExists() {
            // when
            Optional<EnglishWord> result = englishWordService.findById(1L);

            // then
            assertThat(result).isPresent();
            assertThat(result.get().getVocabulary()).isEqualTo("apple");
            assertThat(result.get().getMeaning()).isEqualTo("사과");
        }

        @Test
        @DisplayName("존재하지 않는 ID로 조회하면 빈 Optional을 반환한다")
        void returnsEmptyWhenNotExists() {
            // when
            Optional<EnglishWord> result = englishWordService.findById(999L);

            // then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("getRandomWord 메서드는")
    class GetRandomWord {

        @Test
        @DisplayName("단어가 있을 때 랜덤한 단어를 반환한다")
        void returnsRandomWordWhenWordsExist() {
            // when
            Optional<EnglishWord> result = englishWordService.getRandomWord();

            // then
            assertThat(result).isPresent();
            assertThat(result.get().getVocabulary()).isNotBlank();
            assertThat(result.get().getMeaning()).isNotBlank();
        }

        @Test
        @DisplayName("단어가 없을 때 빈 Optional을 반환한다")
        void returnsEmptyWhenNoWordsExist() {
            // given
            englishWordRepository.deleteAll();
            entityManager.flush();
            entityManager.clear();


            // when
            Optional<EnglishWord> result = englishWordService.getRandomWord();

            // then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("checkAnswer 메서드는")
    class CheckAnswer {

        @Test
        @DisplayName("정답이 맞으면 true를 반환한다")
        void returnsTrueForCorrectAnswer() {
            // when
            boolean result = englishWordService.checkAnswer(1L, "사과");

            // then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("정답이 틀리면 false를 반환한다")
        void returnsFalseForWrongAnswer() {
            // when
            boolean result = englishWordService.checkAnswer(2L, "배");

            // then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("단어가 존재하지 않으면 예외를 던진다")
        void throwsExceptionWhenWordNotFound() {
            // when & then
            assertThatThrownBy(() -> englishWordService.checkAnswer(999L, "사과"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("존재하지 않는 단어 ID입니다");
        }

        @Test
        @DisplayName("쉼표로 구분된 여러 정답 중 하나가 맞으면 true를 반환한다")
        void returnsTrueForOneOfMultipleAnswers() {
            // given
            EnglishWord multiAnswerWord = EnglishWord.builder()
                    .vocabulary("student")
                    .meaning("학생, 학도, 공부하는 사람")
                    .hint("학교에 다니는 사람")
                    .difficulty(1)
                    .build();
            EnglishWord saved = englishWordRepository.save(multiAnswerWord);

            // when
            boolean result = englishWordService.checkAnswer(saved.getId(), "학도");

            // then
            assertThat(result).isTrue();
        }
    }
}