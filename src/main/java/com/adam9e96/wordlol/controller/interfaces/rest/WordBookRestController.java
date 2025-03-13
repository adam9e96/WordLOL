package com.adam9e96.wordlol.controller.interfaces.rest;

import com.adam9e96.wordlol.dto.response.WordResponse;
import com.adam9e96.wordlol.dto.request.WordBookRequest;
import com.adam9e96.wordlol.dto.response.WordBookDetailResponse;
import com.adam9e96.wordlol.dto.response.WordBookListResponse;
import com.adam9e96.wordlol.dto.response.WordBookResponse;
import com.adam9e96.wordlol.dto.response.WordBookStudyResponse;
import com.adam9e96.wordlol.enums.Category;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 단어장 관련 REST API 컨트롤러 인터페이스
 * 단어장의 생성, 조회, 수정, 삭제 및 단어장 내 단어 관리 기능을 제공합니다.
 */
@Tag(name = "단어장 API", description = "단어장 관리 및 단어장 내 단어 관련 API")
public interface WordBookRestController {

    /**
     * 새로운 단어장을 생성합니다.
     *
     * @param request 단어장 생성 요청 정보
     * @return 생성된 단어장 정보
     */
    @Operation(summary = "단어장 생성", description = "새로운 단어장을 생성합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어장 생성 성공",
                    content = @Content(schema = @Schema(implementation = WordBookResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping
    ResponseEntity<WordBookResponse> createWordBook(
            @Parameter(description = "생성할 단어장 정보", required = true)
            @RequestBody WordBookRequest request);

    /**
     * 단어장에 포함된 단어 목록을 조회합니다.
     *
     * @param id 단어장 ID
     * @return 단어장에 포함된 단어 목록
     */
    @Operation(summary = "단어장 내 단어 목록 조회", description = "단어장에 포함된 단어 목록을 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없음")
    })
    @GetMapping("/{id}/words")
    ResponseEntity<List<WordResponse>> getWordBookWords(
            @Parameter(description = "조회할 단어장의 ID", required = true)
            @PathVariable("id") Long id);

    /**
     * 특정 카테고리의 모든 단어장에 포함된 단어 목록을 조회합니다.
     *
     * @param category 카테고리
     * @return 해당 카테고리의 모든 단어장에 포함된 단어 목록
     */
    @Operation(summary = "카테고리별 단어 목록 조회", description = "특정 카테고리에 속한 모든 단어장의 단어 목록을 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 카테고리를 찾을 수 없음")
    })
    @GetMapping("/category/{category}/words")
    ResponseEntity<List<WordResponse>> getWordsByCategoryName(
            @Parameter(description = "조회할 카테고리", required = true)
            @PathVariable("category") Category category);

    /**
     * 모든 단어장 목록을 조회합니다.
     *
     * @return 단어장 목록
     */
    @Operation(summary = "단어장 목록 조회", description = "등록된 모든 단어장 목록을 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어장 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "단어장이 없음")
    })
    @GetMapping
    ResponseEntity<List<WordBookListResponse>> getWordBooks();

    /**
     * 특정 카테고리의 단어장 목록을 조회합니다.
     *
     * @param category 카테고리
     * @return 카테고리별 단어장 목록
     */
    @Operation(summary = "카테고리별 단어장 목록 조회", description = "특정 카테고리에 속한 단어장 목록을 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어장 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 카테고리의 단어장을 찾을 수 없음")
    })
    @GetMapping("/category")
    ResponseEntity<List<WordBookResponse>> getWordBooksByCategory(
            @Parameter(description = "조회할 카테고리", required = true)
            @RequestParam("category") Category category);

    /**
     * 단어장을 삭제합니다.
     *
     * @param id 삭제할 단어장 ID
     * @return 삭제 결과
     */
    @Operation(summary = "단어장 삭제", description = "단어장을 삭제합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어장 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없음")
    })
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWordBook(
            @Parameter(description = "삭제할 단어장의 ID", required = true)
            @PathVariable("id") Long id);

    /**
     * 단어장 상세 정보를 조회합니다.
     *
     * @param id 단어장 ID
     * @return 단어장 상세 정보
     */
    @Operation(summary = "단어장 상세 조회", description = "단어장의 상세 정보를 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어장 조회 성공",
                    content = @Content(schema = @Schema(implementation = WordBookDetailResponse.class))),
            @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없음")
    })
    @GetMapping("/{id}")
    ResponseEntity<WordBookDetailResponse> getWordBook(
            @Parameter(description = "조회할 단어장의 ID", required = true)
            @PathVariable("id") Long id);

    /**
     * 단어장을 수정합니다.
     *
     * @param id      수정할 단어장의 ID
     * @param request 수정할 단어장 정보
     * @return 수정된 단어장 정보
     */
    @Operation(summary = "단어장 수정", description = "단어장을 수정합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어장 수정 성공",
                    content = @Content(schema = @Schema(implementation = WordBookResponse.class))),
            @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없음")
    })
    @PutMapping("/{id}")
    ResponseEntity<WordBookResponse> updateWordBook(
            @Parameter(description = "수정할 단어장의 ID", required = true)
            @PathVariable("id") Long id,
            @Parameter(description = "수정할 단어장 정보", required = true)
            @RequestBody WordBookRequest request);

    /**
     * 단어장 학습 데이터를 조회합니다.
     *
     * @param id 단어장 ID
     * @return 단어장 학습 데이터
     */
    @Operation(summary = "단어장 학습 데이터 조회", description = "단어장 학습 데이터를 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단어장 학습 데이터 조회 성공"),
            @ApiResponse(responseCode = "404", description = "단어장을 찾을 수 없음")
    })
    @GetMapping("/{id}/study")
    ResponseEntity<List<WordBookStudyResponse>> getWordBookStudyData(
            @Parameter(description = "조회할 단어장의 ID", required = true)
            @PathVariable("id") Long id);
}