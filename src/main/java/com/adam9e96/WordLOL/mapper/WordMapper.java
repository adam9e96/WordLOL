package com.adam9e96.WordLOL.mapper;

import com.adam9e96.WordLOL.dto.WordResponse;
import com.adam9e96.WordLOL.entity.EnglishWord;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface WordMapper {

    /**
     * 최근 추가된 5개의 단어를 조회합니다.
     * 다순 조회만 하기 떄문에 엔티티로 조회하지 않고 WordResponse로 조회합니다.
     *
     * @return 최근 추가된 5개의 단어
     */
    List<WordResponse> findRecent5Words();

    Long countAllWords();

    List<EnglishWord> findByWordBookId(int wordBookId);
}
