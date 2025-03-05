package com.adam9e96.wordlol.validator;

import com.adam9e96.wordlol.dto.WordBookRequest;
import com.adam9e96.wordlol.dto.WordRequest;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WordBookValidator {
    private final WordValidator wordValidator;

    public void validate(WordBookRequest request) {
        validateWordBook(request);
        validateWords(request.words());
    }

    private void validateWordBook(WordBookRequest request) {
        if (request == null) {
            throw new ValidationException("단어장 정보가 null입니다");
        }

        if (!StringUtils.hasText(request.name())) {
            throw new ValidationException("단어장 이름은 필수입니다");
        }

        if (request.name().length() > 100) {
            throw new ValidationException("단어장 이름은 100자를 초과할 수 없습니다");
        }

        if (!StringUtils.hasText(request.description())) {
            throw new ValidationException("단어장 설명은 필수입니다");
        }

        if (request.description().length() > 500) {
            throw new ValidationException("단어장 설명은 500자를 초과할 수 없습니다");
        }

        if (request.category() == null) {
            throw new ValidationException("카테고리는 필수입니다");
        }
    }

    private void validateWords(List<WordRequest> words) {
        if (words == null || words.isEmpty()) {
            throw new ValidationException("단어장에는 최소 1개 이상의 단어가 필요합니다");
        }

        for (WordRequest word : words) {
            wordValidator.validate(word);
        }
    }

    // 단어장 수정 시 사용할 수 있는 별도의 검증 메서드
    public void validateUpdate(WordBookRequest request, Long id) {
        if (id == null) {
            throw new ValidationException("단어장 ID는 필수입니다");
        }
        validate(request);
    }
}