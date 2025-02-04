package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.entity.WordBook;
import com.adam9e96.WordLOL.mapper.EnglishWordMapper;
import com.adam9e96.WordLOL.mapper.WordMapper;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;


@Service
@Slf4j
@AllArgsConstructor
public class EnglishWordService {
    private final EnglishWordRepository englishWordRepository;
    private final WordMapper wordMapper;
    private final EnglishWordMapper englishWordMapper;

    /**
     * 영어 단어를 조회하여 DTO로 변환한 후 Optional로 반환합니다.
     *
     * @param id 조회할 영어 단어의 고유 ID
     * @return 조회된 영어 단어의 DTO를 Optional로 감싸서 반환합니다.
     */
    public Optional<WordResponse> findVocabularyById(Long id) {
        Optional<EnglishWord> englishWordOptional = englishWordMapper.findById(id);

        if (englishWordOptional.isPresent()) {
            log.info("영어단어 id를 찾음 {}.", id);
        } else {
            log.warn("영어 단어를 찾지못함");
        }
        // 값이 있으면 Optional<WordResponse> 앖이 없으면 Optional.empty() 를 반환
        return englishWordOptional.map(this::toDTO);
    }

    /**
     * 단어를 추가합니다.
     *
     * @param vocabulary 영단어
     * @param meaning    뜻
     * @param hint       힌트
     * @param difficulty 난이도
     *                   <p>
     *                   #todo Optioal로 개선
     */
    public void insertWord(String vocabulary, String meaning, String hint, Integer difficulty) {
        EnglishWord englishWord = EnglishWord.builder()
                .vocabulary(vocabulary)
                .meaning(meaning)
                .hint(hint)
                .difficulty(difficulty)
                .build();
        englishWordRepository.save(englishWord);
    }


    /**
     * 단어 전체 개수를 조회합니다.
     *
     * @return 단어 전체 개수
     */
    public int countAllWordList() {
        return (int) englishWordRepository.count();
    }

    /**
     * 단어를 삭제합니다.
     *
     * @param id 단어 ID
     */
    public void deleteWord(Long id) {
        englishWordRepository.deleteById(id);
    }

    /**
     * 단어를 수정합니다.
     *
     * @param id         단어 ID
     * @param vocabulary 단어
     * @param meaning    뜻
     * @param hint       힌트
     * @param difficulty 난이도
     */
    @Transactional
    public void updateWord(Long id, String vocabulary, String meaning, String hint, Integer difficulty) {
        // 단어 ID로 단어 조회
        Optional<EnglishWord> englishWordOptional = englishWordRepository.findById(id);

        // 단어가 존재하면 수정
        if (englishWordOptional.isPresent()) {
            EnglishWord englishWord = englishWordOptional.get();

            englishWord.update(vocabulary, meaning, hint, difficulty);
            englishWordRepository.save(englishWord);
        }
    }

    /**
     * id 를 모두 조회합니다.
     *
     * @return id 리스트
     */
    public List<Long> findAllIds() {
        return englishWordRepository.findAllIds();
    }

    /**
     * 페이징 처리된 단어 목록을 조회합니다.
     *
     * @param pageable 페이징 정보
     * @return 페이징 처리된 단어 목록
     */
    public Page<WordResponse> findAllWordsWithPaging(Pageable pageable) {
        Page<EnglishWord> wordPage = englishWordRepository.findAll(pageable);
        return wordPage.map(this::toDTO);
    }

    /**
     * 랜덤 단어를 조회합니다.
     * 단어가 없으면 빈 Optional 반환
     *
     * @return 랜덤 단어
     */
    public Optional<WordResponse> getRandomWord() {
        // 전체 단어 개수 조회
        int totalWords = countAllWordList();

        // 단어가 없으면 빈 Optional 반환
        if (totalWords == 0) {
            return Optional.empty();
        }
        // 존재하는 단어 ID 목록 조회
        List<Long> existingIds = findAllIds();

        // 랜덤 단어 ID 선택
        Random random = new Random();
        Long randomId = existingIds.get(random.nextInt(existingIds.size()));

        // 선택된 ID로 단어 조회 및 DTO 변환
//        return Optional.ofNullable(findVocabularyById(randomId));

        return findVocabularyById(randomId);

    }


    /**
     * 사용자가 입력한 답변이 해당 영어 단어의 의미와 일치하는지 확인합니다.
     *
     * @param id         검증할 영어 단어의 고유 ID
     * @param userAnswer 사용자가 입력한 답변
     * @return 정답이 맞으면 true, 틀리면 false
     * @throws IllegalArgumentException 단어가 존재하지 않는 경우
     */
    public Boolean checkAnswer(Long id, String userAnswer) {
        // 단어 조회
        Optional<WordResponse> wordResponseOptional = findVocabularyById(id);
        if (wordResponseOptional.isEmpty()) {
            throw new IllegalArgumentException("존재하지 않는 단어 ID입니다. ID: " + id);
        }
        WordResponse wordResponse = wordResponseOptional.get();
        // 정답 배열 생성 및 공백 제거
        String[] correctAnswers = wordResponse.meaning().split(",");

        // 정답 체크
        Boolean isCorrect = Arrays.stream(correctAnswers)
                .map(String::trim)
                .anyMatch(word -> word.equals(userAnswer));

        return isCorrect;

    }

    /**
     * EnglishWord -> WordResponse 변환
     *
     * @param word 단어 객체
     * @return WordResponse 객체
     */
    private WordResponse toDTO(EnglishWord word) {
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

    public List<WordResponse> findRandom5Words() {
        return wordMapper.findRandom5Words();
    }


    @Transactional
    public void insertWordToBook(String vocabulary, String meaning, String hint, Integer difficulty, WordBook wordBook) {
        EnglishWord englishWord = EnglishWord.builder()
                .vocabulary(vocabulary)
                .meaning(meaning)
                .hint(hint)
                .difficulty(difficulty)
                .wordBook(wordBook)  // 단어장 연결
                .build();
        englishWordRepository.save(englishWord);
    }


    // 단어장 ID로 단어들 조회
    public Page<WordResponse> findWordsByBookId(Long bookId, Pageable pageable) {
        Page<EnglishWord> wordPage = englishWordRepository.findByWordBookId(bookId, pageable);
        return wordPage.map(this::toDTO);
    }

}
