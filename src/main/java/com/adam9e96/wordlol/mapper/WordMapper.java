package com.adam9e96.wordlol.mapper;

import com.adam9e96.wordlol.entity.EnglishWord;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface WordMapper {
    /**
     * 주어진 ID에 해당하는 영어 단어를 조회합니다.
     */
    Optional<EnglishWord> findById(Long id);


    Optional<EnglishWord> findEnglishWordByHint(Long id);

    /**
     * 랜덤하게 5개의 영어 단어를 조회합니다.
     * 결과가 없으면 빈 리스트를 반환합니다.
     */
    List<EnglishWord> findRandom5Words();

    List<Long> findAllIds();


    int countAll();


    List<EnglishWord> findRecent5Words();


    List<EnglishWord> findByWordBookId(Long wordBookId);

}
