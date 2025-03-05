package com.adam9e96.wordlol.validator;

import com.adam9e96.wordlol.common.Constants;
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

    // 단어 유효성 검사
    public void validateVocabulary(String vocabulary) {
        // NotBlank 유효성 검증: 단어가 비어있거나 공백만 있는 경우 예외 발생
        if (!StringUtils.hasText(vocabulary)) {
            throw new ValidationException(Constants.Validation.EMPTY_VOCABULARY_MESSAGE);
        }
        // 영단어 유효성 검증: 영문자, 공백, 하이픈만 포함할 수 있음
        if (!vocabulary.matches(Constants.Validation.VOCABULARY_PATTERN)) {
            throw new ValidationException(Constants.Validation.INVALID_VOCABULARY_MESSAGE);
        }
        // 길이 유효성 검증: 단어는 100자를 초과할 수 없음
        if (vocabulary.length() > Constants.Validation.MAX_LENGTH) {
            throw new ValidationException("단어는 " + Constants.Validation.MAX_LENGTH_MESSAGE);
        }
    }

    // 뜻 유효성 검사
    public void validateMeaning(String meaning) {
        // 뜻이 비어있거나 공백만 있는 경우 예외 발생
        if (!StringUtils.hasText(meaning)) {
            throw new ValidationException(Constants.Validation.EMPTY_MEANING_MESSAGE);
        }
        // 뜻의 길이가 100자를 초과하는 경우 예외 발생
        if (meaning.length() > Constants.Validation.MAX_LENGTH) {
            throw new ValidationException("뜻은 " + Constants.Validation.MAX_LENGTH_MESSAGE);
        }
    }

    // 힌트 유효성 검사
    // hint는 null이 허용되기때문에 null인 경우는 검사하지 않음
    // null 이 아닌 경우 100자만 넘기지 않도록 검사
    public void validateHint(String hint) {
        if (hint != null && hint.length() > Constants.Validation.MAX_LENGTH) {
            throw new ValidationException(Constants.Validation.MAX_LENGTH_MESSAGE);
        }
    }

    // 난이도 유효성 검사
    public void validateDifficulty(Integer difficulty) {
        if (difficulty == 0) {
            throw new ValidationException(Constants.Validation.EMPTY_DIFFICULTY_MESSAGE);
        }
        if (difficulty < Constants.Validation.DIFFICULTY_MIN || difficulty > Constants.Validation.DIFFICULTY_MAX) {
            throw new ValidationException(Constants.Validation.DIFFICULTY_MESSAGE);
        }
    }
}

