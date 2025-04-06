package com.adam9e96.wordlol.common.constants;

/**
 * 애플리케이션 전체에서 사용되는 상수 값을 관리하는 클래스입니다.
 */
public final class Constants {

    // 생성자를 private 으로 선언하여 인스턴스화 방지
    private Constants() {
        throw new AssertionError("Constants 클래스는 인스턴스화할 수 없습니다.");
    }

    /**
     * API 경로 관련 상수
     */
    public static final class ApiPath {

        private ApiPath() {
            throw new AssertionError("ApiPath 클래스는 인스턴스화할 수 없습니다.");
        }

        public static final String BASE_API_PATH = "/api/v1";
        public static final String WORDS = BASE_API_PATH + "/words";
        public static final String WORD_ID = "/{id}";
        public static final String WORD_HINT = WORD_ID + "/hint";
        public static final String WORD_DAILY = "/daily";
        public static final String WORD_RANDOM = "/random";
        public static final String WORD_CHECK = "/check";
        public static final String WORD_LIST = "/list";
        public static final String WORD_SEARCH = "/search";
        public static final String WORD_BOOKS = BASE_API_PATH + "/wordbooks";
        public static final String WORD_BOOKS_ID = "/{id}";
        public static final String WORD_BOOKS_WORDS = "/{id}/words";
        public static final String WORD_BOOKS_STUDY = "/{id}/study";
        public static final String WORD_BOOKS_CATEGORY = "/category/{category}/words";
    }

    /**
     * 뷰 경로 관련 상수
     */
    public static final class ViewPath {
        private ViewPath() {
            throw new AssertionError("ViewPath 클래스는 인스턴스화할 수 없습니다.");
        }

        public static final String WORD_BASE = "/word";
        public static final String WORD_REGISTER = "/register";
        public static final String STUDY = "/study";
        public static final String WORD_LIST = "/list";
        public static final String DASHBOARD = "/dashboard";
        public static final String DAILY = "/daily";
        public static final String SEARCH = "/search";
        public static final String WORD_BOOK_BASE = "/wordbook";
        public static final String WORD_BOOK_CREATE = "/create";
        public static final String WORD_BOOK_LIST = "/list";
        public static final String WORD_BOOK_EDIT = "/{id}/edit";
        public static final String WORD_BOOK_STUDY = "/{id}/study";
        public static final String WORD_BOOK_VIEW = "/{id}/view";
    }


    public static final class Validation {
        private Validation() {
            throw new AssertionError("Validation 클래스는 인스턴스화할 수 없습니다.");
        }
        public static final String VOCABULARY_PATTERN = "^[a-zA-Z\\s-]*$";
        public static final int MAX_LENGTH = 100;
        public static final String MAX_LENGTH_MESSAGE = "100자를 초과할 수 없습니다.";
        public static final String EMPTY_VOCABULARY_MESSAGE = "단어를 입력해주세요.";
        public static final String INVALID_VOCABULARY_MESSAGE = "영단어는 영문자, 공백, 하이픈만 포함할 수 있습니다.";
        public static final String EMPTY_MEANING_MESSAGE = "뜻을 입력해주세요.";
        public static final String EMPTY_DIFFICULTY_MESSAGE = "난이도를 입력해주세요.";
        public static final int DIFFICULTY_MIN = 1;
        public static final int DIFFICULTY_MAX = 5;
        public static final String DIFFICULTY_MESSAGE = "난이도는 1에서 5사이의 값이어야 합니다.";
        public static final String EXISTS_VOCABULARY_MESSAGE = "이미 존재하는 단어입니다.";

    }

}