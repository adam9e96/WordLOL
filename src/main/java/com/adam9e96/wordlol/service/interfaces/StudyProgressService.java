package com.adam9e96.wordlol.service.interfaces;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * 학습 진행 상황을 관리하는 서비스 인터페이스
 * 연속 정답 수(스트릭) 같은 학습 진행 상태를 관리합니다.
 */
@Tag(name = "학습 진행", description = "학습 진행 상황 및 연속 정답 관련 기능")
public interface StudyProgressService {

    /**
     * 연속 정답 수를 증가시킵니다.
     * 사용자가 정답을 맞출 때마다 호출됩니다.
     *
     * @param sessionId 사용자 세션 ID
     * @return 증가된 후의 연속 정답 수
     */
    @Operation(summary = "연속 정답 수 증가", description = "사용자가 정답을 맞췄을 때 연속 정답 수를 증가시킵니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "연속 정답 수 증가 성공",
                    content = @Content(schema = @Schema(implementation = Integer.class)))
    })
    int incrementPerfectRun(@Parameter(description = "사용자 세션 ID", required = true) String sessionId);

    /**
     * 연속 정답 수를 초기화합니다.
     * 사용자가 오답을 제출할 때 호출됩니다.
     *
     * @param sessionId 사용자 세션 ID
     */
    @Operation(summary = "연속 정답 수 초기화", description = "사용자가 오답을 제출했을 때 연속 정답 수를 초기화합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "연속 정답 수 초기화 성공")
    })
    void resetPerfectRun(@Parameter(description = "사용자 세션 ID", required = true) String sessionId);

    /**
     * 현재 연속 정답 수를 조회합니다.
     *
     * @param sessionId 사용자 세션 ID
     * @return 현재 연속 정답 수
     */
    @Operation(summary = "현재 연속 정답 수 조회", description = "사용자의 현재 연속 정답 수를 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "연속 정답 수 조회 성공",
                    content = @Content(schema = @Schema(implementation = Integer.class)))
    })
    int getCurrentPerfectRun(@Parameter(description = "사용자 세션 ID", required = true) String sessionId);
}