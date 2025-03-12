package com.adam9e96.wordlol.domain.wordbook.mapping;

import com.adam9e96.wordlol.domain.wordbook.dto.WordBookDetailResponse;
import com.adam9e96.wordlol.domain.wordbook.dto.WordBookListResponse;
import com.adam9e96.wordlol.domain.wordbook.dto.WordBookResponse;
import com.adam9e96.wordlol.domain.wordbook.dto.WordBookStudyResponse;
import com.adam9e96.wordlol.domain.word.entity.Word;
import com.adam9e96.wordlol.domain.wordbook.entity.WordBook;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WordBookEntityMapper {
    WordBookResponse toDto(WordBook wordBook);

    WordBookStudyResponse toStudyDto(Word word);

    WordBookDetailResponse toDetailDto(WordBook wordBook);

    @Mapping(target = "wordCount", expression = "java(wordBook.getWords().size())")
    WordBookResponse toResponse(WordBook wordBook);

    @Mapping(target = "wordCount", expression = "java(wordBook.getWords().size())")
    WordBookListResponse toListDto(WordBook wordBook);
}
