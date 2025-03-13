package com.adam9e96.wordlol.dto.request;

/**
 * 단어 검색 요청 DTO
 *
 * @param keyword 검색 키워드 (단어 또는 의미에서 검색)
 * @param page    페이지 번호 (0부터 시작)
 * @param size    한 페이지에 보여줄 항목 수
 */
public record WordSearchRequest(
        String keyword,
        Integer page,
        Integer size
) {
    /**
     * 기본 생성자
     *
     * @param keyword 검색 키워드
     */
    public WordSearchRequest(String keyword) {
        this(keyword, 0, 20);
    }
}