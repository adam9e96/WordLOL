package com.adam9e96.wordlol.mapper.entity;

import com.adam9e96.wordlol.dto.response.WordBookDetailResponse;
import com.adam9e96.wordlol.dto.response.WordBookListResponse;
import com.adam9e96.wordlol.dto.response.WordBookResponse;
import com.adam9e96.wordlol.dto.response.WordBookStudyResponse;
import com.adam9e96.wordlol.entity.Word;
import com.adam9e96.wordlol.entity.WordBook;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WordBookEntityMapper {

    WordBookStudyResponse toStudyDto(Word word);

    WordBookDetailResponse toDetailDto(WordBook wordBook);

    @Mapping(target = "wordCount", expression = "java(wordBook.getWords().size())")
    WordBookResponse toResponse(WordBook wordBook);

    @Mapping(target = "wordCount", expression = "java(wordBook.getWords().size())")
    WordBookListResponse toListDto(WordBook wordBook);

}
