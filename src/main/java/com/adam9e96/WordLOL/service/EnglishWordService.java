package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.entity.WordBook;
import com.adam9e96.WordLOL.mapper.WordMapper;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@AllArgsConstructor
public class EnglishWordService {
    private final EnglishWordRepository englishWordRepository;
    private final WordMapper wordMapper;

    /**
     * 단어를 조회합니다.
     *
     * @param id 단어 ID
     * @return 단어 정보
     */
    public WordResponse findVocabularyById(Long id) {
        Optional<EnglishWord> englishWord = englishWordRepository.findById(id);

        return englishWord.map(this::convertToDTO).orElse(null);
    }

    /**
     * 단어를 추가합니다.
     *
     * @param vocabulary 영단어
     * @param meaning    뜻
     * @param hint       힌트
     * @param difficulty 난이도
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
        return wordPage.map(this::convertToDTO);
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
        return Optional.ofNullable(findVocabularyById(randomId));

    }

    public Boolean checkAnswer(Long id, String userAnswer) {

        // 단어 조회
        WordResponse wordResponse = findVocabularyById(id);
        if (wordResponse == null) {
            throw new IllegalArgumentException("존재하지 않는 단어 ID입니다.");
        }
        // 정답 배열 생성 및 공백 제거
        String[] correctAnswers = wordResponse.meaning().split(",");

        // 정답 체크
        return Arrays.stream(correctAnswers)
                .map(String::trim)
                .anyMatch(answer -> answer.equals(userAnswer));

    }

    /**
     * EnglishWord -> WordResponse 변환
     *
     * @param word 단어 객체
     * @return WordResponse 객체
     */
    private WordResponse convertToDTO(EnglishWord word) {
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
        return wordPage.map(this::convertToDTO);
    }

}
