package com.adam9e96.wordlol.repository.mybatis;

import com.adam9e96.wordlol.entity.Word;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.parameters.P;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Mapper
public interface WordMapper {

    int save(Word word);

    Optional<Word> findById(Long id);

    Optional<Word> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    Optional<Word> findByIdAndWordBookId(@Param("id") Long id, @Param("wordBookId") Long wordBookId);

    void update(Word word);

    Optional<Word> findWordByHint(Long id);

    List<Word> findRandom5Words();

    int countAll();

    List<Word> findRecent5Words();

    List<Word> findByWordBookId(Long wordBookId);

    void deleteById(Long id);

    List<Word> findRandomWordsByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    List<Word> findAllByWordBookId(Long wordBookId);

    List<Word> findAllWithPaging(Pageable pageable);

    List<Word> searchWords(
            @Param("keyword") String keyword,
            @Param("userId") Long userId,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    /**
     * 검색 조건에 맞는 단어의 총 개수를 조회합니다.
     *
     * @param keyword 검색어 (단어 또는 의미에 포함된 내용)
     * @param userId 현재 사용자 ID
     * @return 검색 조건에 맞는 총 단어 수
     */
    long countSearchResults(
            @Param("keyword") String keyword,
            @Param("userId") Long userId
    );

    void batchSave(List<Word> words);

    long countByUser(@Param("userId") Long userId);

    Word findRandomWordByUserId(@Param("userId") Long userId);

    List<Word> findByUserWithPaging(@Param("userId") Long userId, @Param("pageable") Pageable pageable);
}
