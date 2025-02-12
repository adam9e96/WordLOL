package com.adam9e96.wordlol.service;

import com.adam9e96.wordlol.entity.EnglishWord;
import com.adam9e96.wordlol.repository.EnglishWordRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

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
    // ========================================================================//
    // word-list 관련
    @Nested
    @DisplayName("updateWord 메서드는")
    class UpdateWord {

        @Test
        @DisplayName("존재하는 단어의 정보를 수정한다")
        void updatesExistingWord() {
            // given
            Long wordId = 1L;
            String newVocabulary = "updated_book";
            String newMeaning = "수정된 책";
            String newHint = "수정된 힌트";
            Integer newDifficulty = 2;

            // when
            Optional<EnglishWord> result = englishWordService.updateWord(
                    wordId, newVocabulary, newMeaning, newHint, newDifficulty
            );
            entityManager.flush();
            entityManager.clear();

            // then
            assertThat(result).isPresent();
            assertThat(result.get())
                    .satisfies(word -> {
                        assertThat(word.getVocabulary()).isEqualTo(newVocabulary);
                        assertThat(word.getMeaning()).isEqualTo(newMeaning);
                        assertThat(word.getHint()).isEqualTo(newHint);
                        assertThat(word.getDifficulty()).isEqualTo(newDifficulty);
                        assertThat(word.getUpdatedAt()).isNotEqualTo(word.getCreatedAt());
                    });
        }

        @Test
        @DisplayName("존재하지 않는 단어를 수정하면 빈 Optional을 반환한다")
        void returnsEmptyWhenUpdatingNonExistentWord() {
            // when
            Optional<EnglishWord> result = englishWordService.updateWord(
                    999L, "test", "테스트", "힌트", 1
            );

            // then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("deleteWord 메서드는")
    class DeleteWord {

        @Test
        @DisplayName("존재하는 단어를 삭제한다")
        void deletesExistingWord() {
            // given
            Long wordId = 1L;
            assertThat(englishWordRepository.findById(wordId)).isPresent();

            // when
            englishWordService.deleteWord(wordId);
            entityManager.flush();
            entityManager.clear();

            // then
            assertThat(englishWordRepository.findById(wordId)).isEmpty();
        }

        @Test
        @DisplayName("존재하지 않는 단어를 삭제해도 예외가 발생하지 않는다")
        void doesNotThrowExceptionWhenDeletingNonExistentWord() {
            // when & then
            assertThatCode(() -> englishWordService.deleteWord(999L))
                    .doesNotThrowAnyException();
        }
    }

    @Nested
    @DisplayName("findAllWordsWithPaging 메서드는")
    class FindAllWordsWithPaging {

        @Test
        @DisplayName("페이징된 단어 목록을 반환한다")
        void returnsPaginatedWords() {
            // given
            int pageSize = 5;
            for (int i = 0; i < 20; i++) {
                englishWordService.createWord(
                        "word" + i,
                        "의미" + i,
                        "힌트" + i,
                        1
                );
            }
            entityManager.flush();
            entityManager.clear();

            // when
            Page<EnglishWord> firstPage = englishWordService.findAllWordsWithPaging(
                    PageRequest.of(0, pageSize, Sort.by("id").ascending())
            );
            Page<EnglishWord> secondPage = englishWordService.findAllWordsWithPaging(
                    PageRequest.of(1, pageSize, Sort.by("id").ascending())
            );

            // then
            assertThat(firstPage.getContent()).hasSize(pageSize);
            assertThat(firstPage.getNumber()).isZero();
            assertThat(firstPage.getTotalElements()).isGreaterThanOrEqualTo(20L);

            assertThat(secondPage.getContent()).hasSize(pageSize);
            assertThat(secondPage.getNumber()).isEqualTo(1);

            // 첫 페이지의 마지막 ID가 두 번째 페이지의 첫 ID보다 작은지 확인
            assertThat(firstPage.getContent().get(pageSize - 1).getId())
                    .isLessThan(secondPage.getContent().get(0).getId());
        }

        @Test
        @DisplayName("단어가 없을 때 빈 페이지를 반환한다")
        void returnsEmptyPageWhenNoWords() {
            // given
            englishWordRepository.deleteAll();
            entityManager.flush();
            entityManager.clear();

            // when
            Page<EnglishWord> result = englishWordService.findAllWordsWithPaging(
                    PageRequest.of(0, 10)
            );

            // then
            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }
    }

    @Nested
    @DisplayName("findRandom5Words 메서드는")
    class FindRandom5Words {

        @Test
        @DisplayName("5개의 랜덤한 단어를 반환한다")
        void returnsFiveRandomWords() {
            // given
            // 충분한 테스트 데이터 생성
            for (int i = 0; i < 10; i++) {
                englishWordService.createWord(
                        "word" + i,
                        "의미" + i,
                        "힌트" + i,
                        1
                );
            }
            entityManager.flush();
            entityManager.clear();

            // when
            List<EnglishWord> result = englishWordService.findRandom5Words();

            // then
            assertThat(result)
                    .hasSize(5)
                    .allSatisfy(word -> {
                        assertThat(word.getVocabulary()).isNotNull();
                        assertThat(word.getMeaning()).isNotNull();
                        assertThat(word.getDifficulty()).isNotNull();
                    });
        }

        @Test
        @DisplayName("단어가 5개 미만일 때 있는 단어만 반환한다")
        void returnsAvailableWordsWhenLessThanFive() {
            // given
            englishWordRepository.deleteAll();
            for (int i = 0; i < 3; i++) {
                englishWordService.createWord(
                        "word" + i,
                        "의미" + i,
                        "힌트" + i,
                        1
                );
            }
            entityManager.flush();
            entityManager.clear();

            // when
            List<EnglishWord> result = englishWordService.findRandom5Words();

            // then
            assertThat(result)
                    .hasSize(3)
                    .allSatisfy(word -> {
                        assertThat(word.getVocabulary()).isNotNull();
                        assertThat(word.getMeaning()).isNotNull();
                        assertThat(word.getDifficulty()).isNotNull();
                    });
        }

        @Test
        @DisplayName("단어가 없을 때 빈 리스트를 반환한다")
        void returnsEmptyListWhenNoWords() {
            // given
            englishWordRepository.deleteAll();
            entityManager.flush();
            entityManager.clear();

            // when
            List<EnglishWord> result = englishWordService.findRandom5Words();

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("매 호출마다 다른 순서의 단어를 반환한다")
        void returnsDifferentOrderEachTime() {
            // given
            for (int i = 0; i < 20; i++) {
                englishWordService.createWord(
                        "word" + i,
                        "의미" + i,
                        "힌트" + i,
                        1
                );
            }
            entityManager.flush();
            entityManager.clear();

            // when
            List<EnglishWord> firstResult = englishWordService.findRandom5Words();
            List<EnglishWord> secondResult = englishWordService.findRandom5Words();

            // then
            List<String> firstVocabs = firstResult.stream()
                    .map(EnglishWord::getVocabulary)
                    .toList();
            List<String> secondVocabs = secondResult.stream()
                    .map(EnglishWord::getVocabulary)
                    .toList();

            // 적어도 하나의 단어는 다른 위치에 있어야 함
            assertThat(firstVocabs)
                    .isNotEqualTo(secondVocabs);
        }
    }
    // ======================================================= //

}