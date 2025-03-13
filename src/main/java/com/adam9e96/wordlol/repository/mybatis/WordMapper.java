package com.adam9e96.wordlol.repository.mybatis;

import com.adam9e96.wordlol.entity.Word;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Mapper
public interface WordMapper {

    void save(Word word);

    /**
     * 주어진 ID에 해당하는 영어 단어를 조회합니다.
     */
    Optional<Word> findById(Long id);

    void update(Word word);


    Optional<Word> findEnglishWordByHint(Long id);

    /**
     * 랜덤하게 5개의 영어 단어를 조회합니다.
     * 결과가 없으면 빈 리스트를 반환합니다.
     */
    List<Word> findRandom5Words();

    List<Long> findAllIds();


    int countAll();


    List<Word> findRecent5Words();


    List<Word> findByWordBookId(Long wordBookId);

    /**
     * ID에 해당하는 영어 단어를 삭제합니다.
     */
    void deleteById(Long id);

    List<Word> findAllByWordBookId(Long wordBookId);

    boolean existsById(Long id);

    List<Word> findAllWithPaging(Pageable pageable);

    long countTotal();  // 전체 개수를 위한 메서드 추가

    List<Word> searchWords(@Param("keyword") String keyword, @Param("offset") int offset, @Param("limit") int limit);

    long countSearchResults(@Param("keyword") String keyword);

    Word findRandomWord();

    void batchSave(List<Word> words);
}
