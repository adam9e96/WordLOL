package com.adam9e96.wordlol.controller.interfaces;

import com.adam9e96.wordlol.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 단어 관련 REST API 컨트롤러 인터페이스
 * 단어의 등록, 조회, 수정, 삭제 및 학습 관련 기능을 제공합니다.
 */
@Tag(name = "단어 API", description = "단어 관리 및 학습 관련 API")
public interface WordRestController {

    /**
     * 새로운 단어를 등록합니다.
     *
     * @param request 단어 등록 요청 정보
     * @return 등록 결과 메시지
     */
    @Operation(summary = "단어 등록", description = "새로운 단어를 등록합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어 등록 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping
    ResponseEntity<Map<String, Object>> createWord(
            @Parameter(description = "등록할 단어 정보", required = true)
            @Valid @RequestBody WordRequest request);

    /**
     * 여러 단어를 일괄 등록합니다.
     *
     * @param requests 등록할 단어 목록
     * @return 등록 결과 및 성공한 단어 수
     */
    @Operation(summary = "다수 단어 등록", description = "여러 단어를 일괄 등록합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어 일괄 등록 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping("/batch")
    ResponseEntity<Map<String, Object>> createWords(
            @Parameter(description = "등록할 단어 목록", required = true)
            @Valid @RequestBody List<WordRequest> requests);

    /**
     * ID로 단어를 조회합니다.
     *
     * @param id 단어 ID
     * @return 단어 정보
     */
    @Operation(summary = "단어 조회", description = "ID로 단어를 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어 조회 성공",
                     content = @Content(schema = @Schema(implementation = WordResponse.class))),
        @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음")
    })
    @GetMapping("/{id}")
    ResponseEntity<WordResponse> getWord(
            @Parameter(description = "조회할 단어의 ID", required = true)
            @PathVariable("id") Long id);

    /**
     * 단어 정보를 수정합니다.
     *
     * @param id 수정할 단어 ID
     * @param request 수정할 단어 정보
     * @return 수정 결과
     */
    @Operation(summary = "단어 수정", description = "단어 정보를 수정합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어 수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음")
    })
    @PutMapping("/{id}")
    ResponseEntity<Void> updateWord(
            @Parameter(description = "수정할 단어의 ID", required = true)
            @PathVariable("id") Long id,
            @Parameter(description = "수정할 단어 정보", required = true)
            @Valid @RequestBody WordRequest request);

    /**
     * 단어를 삭제합니다.
     *
     * @param id 삭제할 단어 ID
     * @return 삭제 결과
     */
    @Operation(summary = "단어 삭제", description = "단어를 삭제합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어 삭제 성공"),
        @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음")
    })
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWord(
            @Parameter(description = "삭제할 단어의 ID", required = true)
            @PathVariable("id") Long id);

    /**
     * 랜덤 단어를 조회합니다.
     *
     * @return 랜덤으로 선택된 단어 정보
     */
    @Operation(summary = "랜덤 단어 조회", description = "학습을 위한 랜덤 단어를 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "랜덤 단어 조회 성공",
                     content = @Content(schema = @Schema(implementation = WordResponse.class))),
        @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음")
    })
    @GetMapping("/random")
    ResponseEntity<WordResponse> getRandomWord();

    /**
     * 단어 학습 시 정답을 확인합니다.
     *
     * @param request 제출한 답변 정보
     * @param session 사용자 세션
     * @return 정답 여부 및 연속 정답 수
     */
    @Operation(summary = "정답 확인", description = "학습 중인 단어의 정답을 확인합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "정답 확인 성공",
                     content = @Content(schema = @Schema(implementation = AnswerResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음")
    })
    @PostMapping("/check")
    ResponseEntity<AnswerResponse> checkAnswer(
            @Parameter(description = "확인할 답변 정보", required = true)
            @Valid @RequestBody AnswerRequest request,
            HttpSession session);

    /**
     * 단어의 중복 여부를 확인합니다.
     *
     * @param vocabulary 확인할 단어
     * @param excludeId 제외할 단어 ID (수정 시 사용)
     * @return 중복 여부 (exists: true/false)
     */
    @Operation(summary = "단어 중복 확인", description = "단어의 중복 여부를 확인합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "중복 확인 성공")
    })
    @GetMapping("/check-duplicate")
    ResponseEntity<Map<String, Boolean>> checkVocabularyDuplicate(
            @Parameter(description = "확인할 단어", required = true)
            @RequestParam String vocabulary,
            @Parameter(description = "제외할 단어 ID (수정 시)")
            @RequestParam(required = false) Long excludeId);

    /**
     * 단어의 힌트를 조회합니다.
     *
     * @param id 단어 ID
     * @return 단어 힌트
     */
    @Operation(summary = "단어 힌트 조회", description = "단어의 힌트를 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "힌트 조회 성공"),
        @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음")
    })
    @GetMapping("/{id}/hint")
    ResponseEntity<Map<String, String>> getWordHint(
            @Parameter(description = "힌트를 조회할 단어의 ID", required = true)
            @PathVariable("id") Long id);

    /**
     * 현재 연속 정답 수를 조회합니다.
     *
     * @param session 사용자 세션
     * @return 현재 연속 정답 수
     */
    @Operation(summary = "연속 정답 수 조회", description = "현재 사용자의 연속 정답 수를 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "연속 정답 수 조회 성공")
    })
    @GetMapping("/streak")
    Map<String, Integer> getCurrentStreak(HttpSession session);

    /**
     * 오늘의 추천 단어 목록을 조회합니다.
     *
     * @return 일일 추천 단어 목록
     */
    @Operation(summary = "오늘의 단어 조회", description = "오늘의 추천 단어 목록을 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "오늘의 단어 조회 성공"),
        @ApiResponse(responseCode = "404", description = "단어를 찾을 수 없음")
    })
    @GetMapping("/daily")
    ResponseEntity<List<DailyWordResponse>> getDailyWords();

    /**
     * 단어 목록을 페이징하여 조회합니다.
     *
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @return 페이징된 단어 목록
     */
    @Operation(summary = "단어 목록 조회", description = "단어 목록을 페이징하여 조회합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어 목록 조회 성공",
                     content = @Content(schema = @Schema(implementation = PageResponse.class)))
    })
    @GetMapping("/list")
    ResponseEntity<PageResponse<WordResponse>> getWords(
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(name = "page", defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "20")
            @RequestParam(name = "size", defaultValue = "20") int size);

    /**
     * 단어를 검색합니다.
     *
     * @param keyword 검색 키워드
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @return 검색 결과 단어 목록
     */
    @Operation(summary = "단어 검색", description = "키워드로 단어를 검색합니다")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "단어 검색 성공",
                     content = @Content(schema = @Schema(implementation = PageResponse.class)))
    })
    @GetMapping("/search")
    ResponseEntity<PageResponse<WordResponse>> searchWords(
            @Parameter(description = "검색 키워드")
            @RequestParam(name = "keyword", required = false) String keyword,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0")
            @RequestParam(name = "page", defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "20")
            @RequestParam(name = "size", defaultValue = "20") int size);
}