package com.adam9e96.wordlol.service.interfaces;

import com.adam9e96.wordlol.exception.validation.ValidationException;
import com.adam9e96.wordlol.dto.response.WordResponse;
import com.adam9e96.wordlol.dto.request.WordBookRequest;
import com.adam9e96.wordlol.dto.response.WordBookDetailResponse;
import com.adam9e96.wordlol.dto.response.WordBookListResponse;
import com.adam9e96.wordlol.dto.response.WordBookResponse;
import com.adam9e96.wordlol.dto.response.WordBookStudyResponse;
import com.adam9e96.wordlol.enums.Category;
import com.adam9e96.wordlol.entity.WordBook;
import com.adam9e96.wordlol.exception.wordbook.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

/**
 * 단어장 관리를 위한 서비스 인터페이스
 * 단어장의 CRUD 기능과 단어장 내 단어 관리 기능을 제공합니다.
 */
@Tag(name = "단어장 관리", description = "단어장의 생성, 조회, 수정, 삭제 및 단어장 내 단어 관리 기능")
public interface WordBookService {

    /**
     * 새로운 단어장을 생성합니다.
     *
     * @param request 생성할 단어장 정보
     * @return 생성된 단어장 엔티티
     * @throws ValidationException 유효하지 않은 입력인 경우
     * @throws WordBookCreationException 단어장 생성 중 오류가 발생한 경우
     */
    @Operation(summary = "단어장 생성", description = "새로운 단어장을 생성합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어장 생성 성공",
                     content = @Content(schema = @Schema(implementation = WordBook.class))),
        @ApiResponse(responseCode = "400", description = "유효하지 않은 입력"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    WordBookResponse createWordBook(@Parameter(description = "생성할 단어장 정보", required = true) WordBookRequest request);

    /**
     * 단어장 ID로 해당 단어장의 단어 목록을 조회합니다.
     *
     * @param wordBookId 조회할 단어장의 ID
     * @return 단어장에 속한 단어 목록
     * @throws WordBookNotFoundException 단어장이 존재하지 않는 경우
     */
    @Operation(summary = "단어장의 단어 목록 조회", description = "단어장 ID로 해당 단어장의 단어 목록을 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어 목록 조회 성공"),
        @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없음")
    })
    List<WordResponse> findWordsByWordBookId(@Parameter(description = "조회할 단어장의 ID", required = true) Long wordBookId);

    /**
     * 카테고리별 단어장 목록을 조회합니다.
     *
     * @param category 조회할 카테고리
     * @return 해당 카테고리의 단어장 목록
     * @throws WordBookNotFoundException 해당 카테고리의 단어장이 없는 경우
     */
    @Operation(summary = "카테고리별 단어장 목록 조회", description = "특정 카테고리의 단어장 목록을 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어장 목록 조회 성공"),
        @ApiResponse(responseCode = "404", description = "해당 카테고리의 단어장을 찾을 수 없음")
    })
    List<WordBookResponse> findWordBookListByCategory(@Parameter(description = "조회할 카테고리", required = true) Category category);

    /**
     * 모든 단어장 목록을 조회합니다.
     *
     * @return 전체 단어장 목록
     * @throws WordBookEmptyException 단어장이 하나도 없는 경우
     */
    @Operation(summary = "전체 단어장 목록 조회", description = "모든 단어장 목록을 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어장 목록 조회 성공"),
        @ApiResponse(responseCode = "404", description = "단어장이 없음")
    })
    List<WordBookListResponse> findAllWordBookList();

    /**
     * 카테고리별 단어 목록을 조회합니다.
     * 해당 카테고리의 모든 단어장에 속한 단어를 조회합니다.
     *
     * @param category 조회할 카테고리
     * @return 해당 카테고리의 모든 단어 목록
     */
    @Operation(summary = "카테고리별 단어 목록 조회", description = "특정 카테고리의 모든 단어장에 속한 단어를 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어 목록 조회 성공")
    })
    List<WordResponse> findWordsByBookCategory(@Parameter(description = "조회할 카테고리", required = true) Category category);

    /**
     * 학습용 단어장 데이터를 조회합니다.
     * 학습 기능에 필요한 단어 정보만 포함됩니다.
     *
     * @param wordBookId 조회할 단어장의 ID
     * @return 학습용 단어 목록
     * @throws WordBookNotFoundException 단어장이 존재하지 않는 경우
     * @throws WordBookEmptyException 단어장에 단어가 없는 경우
     */
    @Operation(summary = "학습용 단어장 데이터 조회", description = "학습에 필요한 단어장 데이터를 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "학습 데이터 조회 성공"),
        @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없거나 단어가 없음")
    })
    List<WordBookStudyResponse> findWordBookStudyData(@Parameter(description = "조회할 단어장의 ID", required = true) Long wordBookId);

    /**
     * 단어장 ID로 단어장을 조회합니다.
     *
     * @param id 조회할 단어장의 ID
     * @return 조회된 단어장 엔티티
     * @throws WordBookNotFoundException 단어장이 존재하지 않는 경우
     */
    @Operation(summary = "단어장 조회", description = "단어장 ID로 단어장을 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어장 조회 성공",
                     content = @Content(schema = @Schema(implementation = WordBook.class))),
        @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없음")
    })
    WordBookDetailResponse findWordBookById(@Parameter(description = "조회할 단어장의 ID", required = true) Long id);

    /**
     * 단어장 정보를 수정합니다.
     *
     * @param id 수정할 단어장의 ID
     * @param request 수정할 단어장 정보
     * @return 수정된 단어장 엔티티
     * @throws WordBookNotFoundException 단어장이 존재하지 않는 경우
     * @throws ValidationException 유효하지 않은 입력인 경우
     * @throws WordBookUpdateException 단어장 수정 중 오류가 발생한 경우
     */
    @Operation(summary = "단어장 수정", description = "단어장 정보를 수정합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어장 수정 성공",
                     content = @Content(schema = @Schema(implementation = WordBook.class))),
        @ApiResponse(responseCode = "400", description = "유효하지 않은 입력"),
        @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    WordBookResponse updateWordBookById(
        @Parameter(description = "수정할 단어장의 ID", required = true) Long id,
        @Parameter(description = "수정할 단어장 정보", required = true) WordBookRequest request
    );

    /**
     * 단어장을 삭제합니다.
     *
     * @param id 삭제할 단어장의 ID
     * @throws WordBookNotFoundException 단어장이 존재하지 않는 경우
     * @throws WordBookDeletionException 단어장 삭제 중 오류가 발생한 경우
     */
    @Operation(summary = "단어장 삭제", description = "단어장을 삭제합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어장 삭제 성공"),
        @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    void deleteWordBookById(@Parameter(description = "삭제할 단어장의 ID", required = true) Long id);
}