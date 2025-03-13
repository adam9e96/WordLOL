package com.adam9e96.wordlol.common.constants;

/**
 * 애플리케이션 전체에서 사용되는 상수 값을 관리하는 클래스입니다.
 * 코드 전체에 하드코딩된 값을 이 클래스를 통해 중앙 집중적으로 관리합니다.
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

        public static final String EMPTY_ID_MESSAGE = "단어 ID는 필수입니다.";
        public static final String EMPTY_UPDATE_WORD_MESSAGE = "수정할 단어는 필수입니다.";

    }

    /**
     * 메시지 관련 상수
     */
    public static final class Message {
        // 성공 메시지
        public static final String SUCCESS = "success";
        public static final String WORD_SAVED = "단어가 성공적으로 등록되었습니다.";
        public static final String WORD_UPDATED = "단어가 수정되었습니다.";
        public static final String WORD_DELETED = "단어가 삭제되었습니다.";
        public static final String WORDBOOK_SAVED = "단어장이 성공적으로 생성되었습니다.";
        public static final String WORDBOOK_UPDATED = "단어장이 성공적으로 수정되었습니다.";

        // 검증 메시지
        public static final String EMPTY_VOCABULARY = "단어를 입력해주세요.";
        public static final String INVALID_VOCABULARY = "영단어는 영문자, 공백, 하이픈만 포함할 수 있습니다";
        public static final String VOCABULARY_LENGTH = "단어는 1자 이상 100자 이하로 입력해주세요";
        public static final String EMPTY_MEANING = "뜻은 필수 입력값입니다";
        public static final String MEANING_LENGTH = "뜻은 1자 이상 100자 이하로 입력해주세요";
        public static final String HINT_LENGTH = "힌트는 100자 이하로 입력해주세요";
        public static final String DIFFICULTY_MIN = "난이도는 1 이상이어야 합니다";
        public static final String DIFFICULTY_MAX = "난이도는 5 이하이어야 합니다";
        public static final String DIFFICULTY_REQUIRED = "난이도는 필수 입력값입니다";
        public static final String DUPLICATE_VOCABULARY = "이미 존재하는 단어입니다.";

        // 오류 메시지
        public static final String WORD_NOT_FOUND = "단어를 찾을 수 없습니다.";
        public static final String WORDBOOK_NOT_FOUND = "단어장을 찾을 수 없습니다.";
        public static final String SERVER_ERROR = "서버 내부 오류가 발생했습니다";
    }

    /**
     * UI 관련 상수
     */
    public static final class Ui {
        public static final String DEFAULT_TOAST_DELAY = "2000";

        // CSS 클래스
        public static final class CssClass {
            public static final String SUCCESS = "success";
            public static final String DANGER = "danger";
            public static final String WARNING = "warning";
            public static final String INFO = "info";
            public static final String PRIMARY = "primary";
        }
    }

    /**
     * 정규식 패턴
     */
    public static final class Pattern {
        public static final String VOCABULARY = "^[a-zA-Z\\s-]*$";
        public static final String MEANING = "^[a-zA-Z가-힣\\s,\\-\\~]+$";
    }
}