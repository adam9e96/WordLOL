package com.adam9e96.WordLOL.mapper;

import com.adam9e96.WordLOL.dto.WordResponse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface WordMapper {

    List<WordResponse> findRandom5Words();

}
