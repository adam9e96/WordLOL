package com.adam9e96.wordlol.mapper.entity;

import com.adam9e96.wordlol.dto.response.DailyWordResponse;
import com.adam9e96.wordlol.dto.request.WordRequest;
import com.adam9e96.wordlol.dto.response.WordResponse;
import com.adam9e96.wordlol.dto.response.WordStudyResponse;
import com.adam9e96.wordlol.entity.Word;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WordEntityMapper {

    // 엔티티 -> DTO 변환
    WordResponse toDto(Word word);

    WordStudyResponse toStudyDto(Word word);

    List<DailyWordResponse> toDailyWordDtoList(List<Word> words);

    // 자동 변환 대신 직접 구현
    default Word toEntity(WordRequest request) {
        if (request == null) {
            return null;
        }

        return Word.builder()
                .vocabulary(request.vocabulary())
                .meaning(request.meaning())
                .hint(request.hint())
                .difficulty(request.difficulty())
                .build();
    }


    // 리스트 변환 메서드
    List<Word> toEntityList(List<WordRequest> requests);

    List<WordResponse> toDtoList(List<Word> words);
}
