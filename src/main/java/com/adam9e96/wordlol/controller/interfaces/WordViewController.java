package com.adam9e96.wordlol.controller.interfaces;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    @GetMapping("/study")
    String showStudyPage();

    /**
     * 단어 등록 페이지를 보여줍니다.
     *
     * @return 단어 등록 페이지 뷰 이름
     */
    @Operation(summary = "단어 등록 페이지", description = "새로운 단어를 등록할 수 있는 페이지를 보여줍니다")
    @GetMapping("/register")
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
    @GetMapping("/list")
    String showListPage();

    /**
     * 대시보드 페이지를 보여줍니다.
     *
     * @return 대시보드 페이지 뷰 이름
     */
    @Operation(summary = "대시보드 페이지", description = "학습 현황과 통계를 보여주는 대시보드 페이지를 보여줍니다")
    @GetMapping("/dashboard")
    String showDashboardPage();

    /**
     * 오늘의 단어 페이지를 보여줍니다.
     *
     * @return 오늘의 단어 페이지 뷰 이름
     */
    @Operation(summary = "오늘의 단어 페이지", description = "오늘의 추천 단어 목록을 보여주는 페이지를 보여줍니다")
    @GetMapping("/daily")
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
    @GetMapping("/search")
    String showSearchResultsPage(
            @Parameter(description = "검색 키워드") @RequestParam(name = "keyword", required = false) String keyword,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(name = "page", defaultValue = "0") int page,
            Model model);

    /**
     * 단어장 생성 페이지를 보여줍니다.
     *
     * @return 단어장 생성 페이지 뷰 이름
     */
    @Operation(summary = "단어장 생성 페이지", description = "새로운 단어장을 생성할 수 있는 페이지를 보여줍니다")
    @GetMapping("/wordbook/create")
    String showWordBookCreatePage();

    /**
     * 단어장 목록 페이지를 보여줍니다.
     *
     * @return 단어장 목록 페이지 뷰 이름
     */
    @Operation(summary = "단어장 목록 페이지", description = "등록된 단어장 목록을 확인할 수 있는 페이지를 보여줍니다")
    @GetMapping("/wordbook/list")
    String showWordBookListPage();

    /**
     * 단어장 수정 페이지를 보여줍니다.
     *
     * @param id    단어장 ID
     * @param model 뷰에 전달할 모델
     * @return 단어장 수정 페이지 뷰 이름
     */
    @Operation(summary = "단어장 수정 페이지", description = "기존 단어장의 정보를 수정할 수 있는 페이지를 보여줍니다")
    @GetMapping("/wordbook/{id}/edit")
    String showWordBookEditPage(
            @Parameter(description = "수정할 단어장의 ID") @PathVariable("id") Long id,
            Model model);

    /**
     * 단어장 학습 페이지를 보여줍니다.
     *
     * @param id    단어장 ID
     * @param model 뷰에 전달할 모델
     * @return 단어장 학습 페이지 뷰 이름
     */
    @Operation(summary = "단어장 학습 페이지", description = "특정 단어장의 단어를 학습할 수 있는 페이지를 보여줍니다")
    @GetMapping("/wordbook/{id}/study")
    String showWordBookStudyPage(
            @Parameter(description = "학습할 단어장의 ID") @PathVariable("id") Long id,
            Model model);

    /**
     * 단어장 상세 보기 페이지를 보여줍니다.
     *
     * @param id    단어장 ID
     * @param model 뷰에 전달할 모델
     * @return 단어장 상세 보기 페이지 뷰 이름
     */
    @Operation(summary = "단어장 상세 보기 페이지", description = "단어장의 상세 정보와 포함된 단어 목록을 확인할 수 있는 페이지를 보여줍니다")
    @GetMapping("/wordbook/{id}/view")
    String showWordBookViewPage(
            @Parameter(description = "조회할 단어장의 ID") @PathVariable("id") Long id,
            Model model);
}