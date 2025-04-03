package com.adam9e96.wordlol.service.interfaces;

import com.adam9e96.wordlol.dto.request.AnswerRequest;
import com.adam9e96.wordlol.dto.response.*;
import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.exception.word.WordCreationException;
import com.adam9e96.wordlol.exception.word.WordDeletionException;
import com.adam9e96.wordlol.exception.word.WordNotFoundException;
import com.adam9e96.wordlol.exception.word.WordUpdateException;
import com.adam9e96.wordlol.dto.request.WordRequest;
import com.adam9e96.wordlol.dto.request.WordSearchRequest;
import com.adam9e96.wordlol.entity.Word;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 단어 관리를 위한 서비스 인터페이스
 * 단어의 CRUD 기능과 학습 관련 기능을 제공합니다.
 */
@Tag(name = "단어 관리", description = "단어의 생성, 조회, 수정, 삭제 및 학습 관련 기능")
public interface WordService {
    /**
     * 새로운 단어를 생성합니다.
     *
     * @param request 생성할 단어 정보
     * @throws ValidationException   유효하지 않은 입력인 경우
     * @throws WordCreationException 단어 생성 중 오류가 발생한 경우
     */
    @Operation(summary = "단어 생성", description = "새로운 단어를 생성합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어 생성 성공"),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 입력"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    CreateWordResponse createWord(@Parameter(description = "생성할 단어 정보", required = true) WordRequest request);

    /**
     * 여러 단어를 일괄 생성합니다.
     *
     * @param requests 생성할 단어 정보 목록
     * @return 성공적으로 생성된 단어의 수
     * @throws ValidationException 유효하지 않은 입력이 있는 경우
     */
    @Operation(summary = "다수 단어 생성", description = "여러 단어를 일괄 생성합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어 생성 성공",
                    content = @Content(schema = @Schema(implementation = Integer.class))),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 입력"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    int createWords(@Parameter(description = "생성할 단어 정보 목록", required = true) List<WordRequest> requests);

    /**
     * ID로 단어를 조회합니다.
     *
     * @param id 조회할 단어의 ID
     * @return 조회된 단어 엔티티
     * @throws WordNotFoundException 단어가 존재하지 않는 경우
     */
    @Operation(summary = "단어 조회", description = "ID로 단어를 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어 조회 성공",
                    content = @Content(schema = @Schema(implementation = Word.class))),
            @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음")
    })
    WordResponse findById(@Parameter(description = "조회할 단어의 ID", required = true) Long id);

    /**
     * 단어 정보를 수정합니다.
     *
     * @param id      수정할 단어의 ID
     * @param request 수정할 단어 정보
     * @throws WordNotFoundException     단어가 존재하지 않는 경우
     * @throws ValidationException 유효하지 않은 입력인 경우
     * @throws WordUpdateException       단어 수정 중 오류가 발생한 경우
     */
    @Operation(summary = "단어 수정", description = "단어 정보를 수정합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어 수정 성공"),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 입력"),
            @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    void updateWord(
            @Parameter(description = "수정할 단어의 ID", required = true) Long id,
            @Parameter(description = "수정할 단어 정보", required = true) WordRequest request
    );

    /**
     * 단어를 삭제합니다.
     *
     * @param id 삭제할 단어의 ID
     * @throws WordNotFoundException 단어가 존재하지 않는 경우
     * @throws WordDeletionException 단어 삭제 중 오류가 발생한 경우
     */
    @Operation(summary = "단어 삭제", description = "단어를 삭제합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    void deleteWord(@Parameter(description = "삭제할 단어의 ID", required = true) Long id);

    /**
     * 단어 목록을 페이징하여 조회합니다.
     *
     * @param pageable 페이징 정보 (페이지 번호, 페이지 크기, 정렬 정보)
     * @return 페이징된 단어 목록
     */
    @Operation(summary = "단어 목록 조회", description = "단어 목록을 페이징하여 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    Page<Word> findAllWithPaging(@Parameter(description = "페이징 정보", required = true) Pageable pageable);

    /**
     * 랜덤 단어를 조회합니다. 학습 기능에서 사용됩니다.
     *
     * @return 무작위로 선택된 단어
     * @throws WordNotFoundException 단어가 없는 경우
     */
    @Operation(summary = "랜덤 단어 조회", description = "학습용 랜덤 단어를 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "랜덤 단어 조회 성공",
                    content = @Content(schema = @Schema(implementation = Word.class))),
            @ApiResponse(responseCode = "404", description = "단어가 없음")
    })
    WordStudyResponse findRandomWord();

    /**
     * 단어의 답안을 검증합니다.
     *
     * @param id         검증할 단어의 ID
     * @param userAnswer 사용자가 입력한 답안
     * @return 정답 여부 (true: 정답, false: 오답)
     * @throws WordNotFoundException     단어가 존재하지 않는 경우
     * @throws ValidationException 유효하지 않은 입력인 경우
     */
    @Operation(summary = "답안 검증", description = "단어의 답안을 검증합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "검증 성공",
                    content = @Content(schema = @Schema(implementation = Boolean.class))),
            @ApiResponse(responseCode = "400", description = "유효하지 않은 입력"),
            @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음")
    })
    Boolean validateAnswer(
            @Parameter(description = "검증할 단어의 ID", required = true) Long id,
            @Parameter(description = "사용자가 입력한 답안", required = true) String userAnswer
    );

    /**
     * 랜덤 단어 목록을 조회합니다. 일일 학습 기능에서 사용됩니다.
     *
     * @return 무작위로 선택된 단어 목록
     * @throws WordNotFoundException 단어가 없는 경우
     */
    @Operation(summary = "랜덤 단어 목록 조회", description = "일일 학습용 랜덤 단어 목록을 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "랜덤 단어 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "단어가 없음")
    })
    List<DailyWordResponse> findRandomWords();

    AnswerResponse checkAnswer(
            AnswerRequest answerRequest,
            HttpSession session
    );

    /**
     * 단어의 중복 여부를 확인합니다.
     *
     * @param vocabulary 확인할 단어
     * @param excludeId  제외할 단어 ID (수정 시 자기 자신 제외)
     * @return 중복 여부 (true: 중복, false: 중복 아님)
     */
    @Operation(summary = "단어 중복 확인", description = "단어의 중복 여부를 확인합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "중복 확인 성공",
                    content = @Content(schema = @Schema(implementation = Boolean.class)))
    })
    boolean checkVocabularyDuplicate(
            @Parameter(description = "확인할 단어", required = true) String vocabulary,
            @Parameter(description = "제외할 단어 ID (수정 시)") Long excludeId
    );

    /**
     * 검색 조건에 맞는 단어 목록을 조회합니다.
     *
     * @param request  검색 조건
     * @param pageable 페이징 정보
     * @return 검색 조건에 맞는 페이징된 단어 목록
     */
    @Operation(summary = "단어 검색", description = "검색 조건에 맞는 단어 목록을 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어 검색 성공",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    Page<Word> searchWords(
            @Parameter(description = "검색 조건", required = true) WordSearchRequest request,
            @Parameter(description = "페이징 정보", required = true) Pageable pageable
    );

    WordHintResponse getWordHint(Long id);
}