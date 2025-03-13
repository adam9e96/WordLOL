package com.adam9e96.wordlol.controller.interfaces.view;

import com.adam9e96.wordlol.common.constants.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 단어 관련 뷰 컨트롤러 인터페이스
 * 단어 학습, 등록, 조회 등의 화면을 제공합니다.
 */
@Tag(name = "단어 화면", description = "단어 관련 화면 요청을 처리하는 컨트롤러")
public interface WordViewController {
    /**
     * 단어 학습 페이지를 보여줍니다.
     *
     * @return 단어 학습 페이지 뷰 이름
     */
    @Operation(summary = "단어 학습 페이지", description = "랜덤 단어를 이용한 학습 페이지를 보여줍니다")
    @GetMapping(Constants.ViewPath.STUDY)
    String showStudyPage();

    /**
     * 단어 등록 페이지를 보여줍니다.
     *
     * @return 단어 등록 페이지 뷰 이름
     */
    @Operation(summary = "단어 등록 페이지", description = "새로운 단어를 등록할 수 있는 페이지를 보여줍니다")
    @GetMapping(Constants.ViewPath.WORD_REGISTER)
    String showRegisterPage();

    /**
     * 다수의 단어 등록 페이지를 보여줍니다.
     *
     * @return 다수의 단어 등록 페이지 뷰 이름
     */
    @Operation(summary = "다수 단어 등록 페이지", description = "여러 단어를 한 번에 등록할 수 있는 페이지를 보여줍니다")
    @GetMapping("/words/register")
    String showWordsRegisterPage();

    /**
     * 단어 목록 페이지를 보여줍니다.
     *
     * @return 단어 목록 페이지 뷰 이름
     */
    @Operation(summary = "단어 목록 페이지", description = "등록된 단어 목록을 확인할 수 있는 페이지를 보여줍니다")
    @GetMapping(Constants.ViewPath.WORD_LIST)
    String showListPage();

    /**
     * 대시보드 페이지를 보여줍니다.
     *
     * @return 대시보드 페이지 뷰 이름
     */
    @Operation(summary = "대시보드 페이지", description = "학습 현황과 통계를 보여주는 대시보드 페이지를 보여줍니다")
    @GetMapping(Constants.ViewPath.DASHBOARD)
    String showDashboardPage();

    /**
     * 오늘의 단어 페이지를 보여줍니다.
     *
     * @return 오늘의 단어 페이지 뷰 이름
     */
    @Operation(summary = "오늘의 단어 페이지", description = "오늘의 추천 단어 목록을 보여주는 페이지를 보여줍니다")
    @GetMapping(Constants.ViewPath.DAILY)
    String showDailyPage();

    /**
     * 단어 검색 결과 페이지를 보여줍니다.
     *
     * @param keyword 검색 키워드
     * @param page    페이지 번호
     * @param model   뷰에 전달할 모델
     * @return 검색 결과 페이지 뷰 이름
     */
    @Operation(summary = "단어 검색 결과 페이지", description = "검색 키워드에 해당하는 단어 목록을 보여주는 페이지를 보여줍니다")
    @GetMapping(Constants.ViewPath.SEARCH)
    String showSearchResultsPage(
            @Parameter(description = "검색 키워드") @RequestParam(name = "keyword", required = false) String keyword,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(name = "page", defaultValue = "0") int page,
            Model model);


}