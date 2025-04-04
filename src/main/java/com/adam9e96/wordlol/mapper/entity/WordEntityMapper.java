package com.adam9e96.wordlol.mapper.entity;

import com.adam9e96.wordlol.dto.response.*;
import com.adam9e96.wordlol.entity.Word;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WordEntityMapper {

    // 엔티티 -> DTO 변환
    WordResponse toDto(Word word);

    WordStudyResponse toStudyDto(Word word);

    List<DailyWordResponse> toDailyWordDtoList(List<Word> words);

    // 엔티티 -> DTO 변환
    @Mapping(target = "message", constant = "단어가 성공적으로 등록되었습니다.")
    @Mapping(target = "wordId", source = "id")
    @Mapping(target = "timestamp", expression = "java(java.time.LocalDateTime.now())")
    CreateWordResponse toCreateDto(Word word);

    @Mapping(target = "hint", source = "hint")
    WordHintResponse toHintDto(Word word);

    // 엔티티 리스트 -> DTO 리스트 변환
    List<WordResponse> toDtoList(List<Word> words);
}
