package com.adam9e96.wordlol.controller.interfaces;

import com.adam9e96.wordlol.common.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping(Constants.ViewPath.WORD_BOOK_BASE)
@Tag(name = "단어장 화면", description = "단어장 관련 화면 요청을 처리하는 컨트롤러")
public interface WordBookViewController {

    /**
     * 단어장 생성 페이지를 보여줍니다.
     *
     * @return 단어장 생성 페이지 뷰 이름
     */
    @Operation(summary = "단어장 생성 페이지", description = "새로운 단어장을 생성할 수 있는 페이지를 보여줍니다")
    @GetMapping(Constants.ViewPath.WORD_BOOK_CREATE)
    String showWordBookCreatePage();

    /**
     * 단어장 목록 페이지를 보여줍니다.
     *
     * @return 단어장 목록 페이지 뷰 이름
     */
    @Operation(summary = "단어장 목록 페이지", description = "등록된 단어장 목록을 확인할 수 있는 페이지를 보여줍니다")
    @GetMapping(Constants.ViewPath.WORD_BOOK_LIST)
    String showWordBookListPage();

    /**
     * 단어장 수정 페이지를 보여줍니다.
     *
     * @param id    단어장 ID
     * @param model 뷰에 전달할 모델
     * @return 단어장 수정 페이지 뷰 이름
     */
    @Operation(summary = "단어장 수정 페이지", description = "기존 단어장의 정보를 수정할 수 있는 페이지를 보여줍니다")
    @GetMapping(Constants.ViewPath.WORD_BOOK_EDIT)
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
    @GetMapping(Constants.ViewPath.WORD_BOOK_STUDY)
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
    @GetMapping(Constants.ViewPath.WORD_BOOK_VIEW)
    String showWordBookViewPage(
            @Parameter(description = "조회할 단어장의 ID") @PathVariable("id") Long id,
            Model model);
}
