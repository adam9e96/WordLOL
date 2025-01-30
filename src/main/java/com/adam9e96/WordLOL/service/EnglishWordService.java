package com.adam9e96.WordLOL.service;

import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.EnglishWord;
import com.adam9e96.WordLOL.repository.EnglishWordRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EnglishWordService {
    private final EnglishWordRepository englishWordRepository;

    public WordResponse findVocabularyById(Long id) {
        Optional<EnglishWord> englishWord = englishWordRepository.findById(id);

        if (englishWord.isPresent()) {
            return new WordResponse(englishWord.get().getId(),
                    englishWord.get().getVocabulary(),
                    englishWord.get().getMeaning(),
                    englishWord.get().getHint());
        }
        return null;

    }

    public void insertWord(String vocabulary, String meaning, String hint) {
        EnglishWord englishWord = EnglishWord.builder()
                .vocabulary(vocabulary)
                .meaning(meaning)
                .hint(hint)
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

    public void deleteWord(Long id) {
        englishWordRepository.deleteById(id);
    }

    public void updateWord(Long id, String vocabulary, String meaning, String hint) {
        Optional<EnglishWord> englishWordOptional = englishWordRepository.findById(id);
        if (englishWordOptional.isPresent()) {
            EnglishWord englishWord = englishWordOptional.get();

            englishWord.update(vocabulary, meaning, hint);
            englishWordRepository.save(englishWord);
        }
    }


    public List<WordResponse> findAllWords() {
        return englishWordRepository.findAll().stream()
                .map(word -> new WordResponse(word.getId(),
                        word.getVocabulary(),
                        word.getMeaning(),
                        word.getHint()))
                .collect(Collectors.toList());
    }

    public List<Long> findAllIds() {
        return englishWordRepository.findAll().stream()
                .map(EnglishWord::getId)
                .collect(Collectors.toList());
    }

    public Page<WordResponse> findAllWordsWithPaging(Pageable pageable) {
        Page<EnglishWord> wordPage = englishWordRepository.findAll(pageable);
        return wordPage.map(word -> new WordResponse(
                word.getId(),
                word.getVocabulary(),
                word.getMeaning(),
                word.getHint()
        ));
    }

}
