package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.entity.EnglishWord;
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
    private final Random random = new Random();


    /**
     * READ
     * ID로 단어 조회
     */
    public Optional<EnglishWord> findById(Long id) {
        return englishWordMapper.findById(id);
    }


    /**
     * CREATE
     * 단어를 추가합니다.
     */
    public void createWord(String vocabulary, String meaning, String hint, Integer difficulty) {
        EnglishWord englishWord = EnglishWord.builder()
                .vocabulary(vocabulary)
                .meaning(meaning)
                .hint(hint)
                .difficulty(difficulty)
                .build();
        englishWordRepository.save(englishWord);
    }


    /**
     * UPDATE
     * 단어를 수정합니다.
     */
    @Transactional
    public Optional<EnglishWord> updateWord(Long id, String vocabulary, String meaning, String hint, Integer difficulty) {
        return englishWordMapper.findById(id)
                .map(word -> {
                    word.update(vocabulary, meaning, hint, difficulty);
                    return englishWordRepository.save(word);
                });
    }


    /**
     * DELETE
     * 단어를 삭제합니다.
     */
    public void deleteWord(Long id) {
        englishWordRepository.deleteById(id);
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
     * 페이징 처리된 단어 목록을 조회합니다.
     *
     * @param pageable 페이징 정보
     * @return 페이징 처리된 단어 목록
     */
    public Page<EnglishWord> findAllWordsWithPaging(Pageable pageable) {
        return englishWordRepository.findAll(pageable);
    }

    /**
     * 랜덤 단어를 조회합니다.
     * 단어가 없으면 빈 Optional 반환
     */
    public Optional<EnglishWord> getRandomWord() {
        // 전체 단어 개수 조회
        List<Long> ids = englishWordMapper.findAllIds();

        if (ids.isEmpty()) {
            return Optional.empty();
        }

        Long randomId = ids.get(random.nextInt(ids.size()));
        return englishWordMapper.findById(randomId);

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
        Optional<EnglishWord> wordResponseOptional = findById(id);
        if (wordResponseOptional.isEmpty()) {
            throw new IllegalArgumentException("존재하지 않는 단어 ID입니다. ID: " + id);
        }
        EnglishWord wordResponse = wordResponseOptional.get();
        // 정답 배열 생성 및 공백 제거
        String[] correctAnswers = wordResponse.getMeaning().split(",");

        return Arrays.stream(correctAnswers)
                .map(String::trim)
                .anyMatch(word -> word.equals(userAnswer));

    }

    public List<EnglishWord> findRandom5Words() {
        return englishWordMapper.findRandom5Words();
    }


//    @Transactional
//    public void insertWordToBook(String vocabulary, String meaning, String hint, Integer difficulty, WordBook wordBook) {
//        EnglishWord englishWord = EnglishWord.builder()
//                .vocabulary(vocabulary)
//                .meaning(meaning)
//                .hint(hint)
//                .difficulty(difficulty)
//                .wordBook(wordBook)  // 단어장 연결
//                .build();
//        englishWordRepository.save(englishWord);
//    }


    // 단어장 ID로 단어들 조회
    public Page<EnglishWord> findWordsByBookId(Long bookId, Pageable pageable) {
        return englishWordRepository.findByWordBookId(bookId, pageable);

    }

}
