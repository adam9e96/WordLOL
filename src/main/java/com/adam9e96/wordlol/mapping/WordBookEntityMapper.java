package com.adam9e96.wordlol.mapping;

import com.adam9e96.wordlol.dto.WordBookDetailResponse;
import com.adam9e96.wordlol.dto.WordBookListResponse;
import com.adam9e96.wordlol.dto.WordBookResponse;
import com.adam9e96.wordlol.dto.WordBookStudyResponse;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.entity.WordBook;
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
