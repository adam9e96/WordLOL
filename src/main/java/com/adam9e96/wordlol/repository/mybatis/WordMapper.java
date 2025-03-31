package com.adam9e96.wordlol.repository.mybatis;

import com.adam9e96.wordlol.entity.Word;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Pageable;

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

    List<Word> findAllByWordBookId(Long wordBookId);

    List<Word> findAllWithPaging(Pageable pageable);

    List<Word> searchWords(@Param("keyword") String keyword, @Param("offset") int offset, @Param("limit") int limit);

    long countSearchResults(@Param("keyword") String keyword);

    Word findRandomWord();

    void batchSave(List<Word> words);

    long countByUser(@Param("userId") Long userId);

    List<Word> findByUserWithPaging(@Param("userId") Long userId, @Param("pageable") Pageable pageable);
}
