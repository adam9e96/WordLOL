package com.adam9e96.WordLOL.mapper;

import com.adam9e96.WordLOL.entity.EnglishWord;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface EnglishWordMapper {
    /**
     * 주어진 ID에 해당하는 영어 단어를 조회합니다.
     *
     * @param id 조회할 영어 단어의 고유 ID
     * @return 조회된 영어 단어를 Optional로 감싸서 반환. 단어가 없으면 Optional.empty() 반환.
     */
    Optional<EnglishWord> findById(Long id);

}
