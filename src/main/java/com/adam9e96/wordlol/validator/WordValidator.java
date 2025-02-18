package com.adam9e96.wordlol.validator;

import com.adam9e96.wordlol.dto.WordRequest;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class WordValidator {

    public void validate(WordRequest request) {
        validateVocabulary(request.vocabulary());
        validateMeaning(request.meaning());
        validateHint(request.hint());
        validateDifficulty(request.difficulty());
    }

    // 메서드들을 public 으로 변경하여 재사용 가능하게 함
    public void validateVocabulary(String vocabulary) {
        if (!StringUtils.hasText(vocabulary)) {
            throw new ValidationException("단어를 입력해주세요.");
        }
        if (!vocabulary.matches("^[a-zA-Z\\s-]+$")) {
            throw new ValidationException("영단어는 영문자, 공백, 하이픈만 포함할 수 있습니다.");
        }
        if (vocabulary.length() > 100) {
            throw new ValidationException("단어는 100자를 초과할 수 없습니다.");
        }
    }

    public void validateMeaning(String meaning) {
        if (!StringUtils.hasText(meaning)) {
            throw new ValidationException("뜻을 입력해주세요.");
        }
        if (meaning.length() > 100) {
            throw new ValidationException("뜻은 100자를 초과할 수 없습니다.");
        }
    }

    public void validateHint(String hint) {
        if (hint != null && hint.length() > 100) {
            throw new ValidationException("힌트는 100자를 초과할 수 없습니다.");
        }
    }

    public void validateDifficulty(Integer difficulty) {
        if (difficulty == null || difficulty < 1 || difficulty > 5) {
            throw new ValidationException("난이도는 1에서 5 사이의 값이어야 합니다.");
        }
    }
}

