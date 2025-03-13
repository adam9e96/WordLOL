package com.adam9e96.wordlol.service.interfaces;

import com.adam9e96.wordlol.dto.response.DashBoardResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


/**
 * 대시보드 정보를 제공하는 서비스 인터페이스
 * 학습 통계, 단어 현황 등의 대시보드 데이터를 제공합니다.
 */
@Tag(name = "대시보드", description = "대시보드 데이터 관련 기능")
public interface DashboardService {

    /**
     * 대시보드에 표시할 데이터를 조회합니다.
     * 전체 단어 수, 오늘 학습한 단어 수, 현재 연속 정답 수, 정답률, 최근 추가된 단어 등을 포함합니다.
     *
     * @return 대시보드 표시용 데이터
     */
    @Operation(summary = "대시보드 데이터 조회", description = "대시보드에 표시할 데이터를 조회합니다")
    DashBoardResponse getDashboardData();
}
