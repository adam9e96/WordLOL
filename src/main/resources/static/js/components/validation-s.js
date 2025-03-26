/**
 * ValidationService - 사용자 입력 유효성 검증 유틸리티
 * 단어, 뜻, 힌트, 난이도 등 입력값의 유효성을 검증하는 기능을 제공합니다.
 *
 * 사용 예시:
 * // 단어 유효성 검증
 * const result = ValidationService.validateVocabulary('apple');
 * if (result.isValid) {
 *   // 유효한 경우 처리
 * } else {
 *   showErrorToast(result.message);
 * }
 *
 * // 또는 간편한 방식으로:
 * if (!validateVocabulary('apple', { showToast: true })) {
 *   return; // 유효하지 않은 경우 처리 중단
 * }
 */
class ValidationService {
    constructor() {
        /**
         * 에러 메시지 상수
         * @type {Object}
         */
        this.ERROR_MESSAGES = {
            vocabulary: {
                required: '영단어를 입력해주세요.',
                pattern: '영단어는 영문자, 공백, 하이픈만 사용할 수 있습니다.',
                length: '영단어는 2자 이상 100자 이하로 입력해주세요.',
                duplicate: '이미 등록된 단어입니다.'
            },
            meaning: {
                required: '뜻을 입력해주세요.',
                length: '뜻은 1자 이상 100자 이하로 입력해주세요.',
                pattern: '뜻은 한글, 영문, 공백, 쉼표만 사용할 수 있습니다.'
            },
            hint: {
                length: '힌트는 100자 이하로 입력해주세요.'
            },
            difficulty: {
                required: '난이도를 선택해주세요.',
                range: '난이도는 1에서 5 사이의 값이어야 합니다.'
            }
        };

        /**
         * 정규식 패턴
         * @type {Object}
         */
        this.PATTERNS = {
            vocabulary: /^[a-zA-Z\s\-]+$/,
            meaning: /^[가-힣a-zA-Z\s,\-~]+$/
        };
    }

    // 싱글톤 인스턴스 획득
    static getInstance() {
        if (!ValidationService.instance) {
            ValidationService.instance = new ValidationService();
        }
        return ValidationService.instance;
    }

    /**
     * 영단어 유효성 검증
     * @param {string} value - 검증할 영단어
     * @param {Object} [options={}] - 추가 옵션
     * @param {boolean} [options.allowEmpty=false] - 빈 값 허용 여부
     * @param {Function} [options.onDuplicate] - 중복 확인 함수 (async)
     * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
     */
    validateVocabulary(value, options = {}) {
        const { allowEmpty = false } = options;

        // 빈 값 처리
        if (!value || value.trim() === '') {
            return allowEmpty
                ? { isValid: true, message: '' }
                : { isValid: false, message: this.ERROR_MESSAGES.vocabulary.required };
        }

        const trimmedValue = value.trim();

        // 패턴 검증
        if (!this.PATTERNS.vocabulary.test(trimmedValue)) {
            return { isValid: false, message: this.ERROR_MESSAGES.vocabulary.pattern };
        }

        // 길이 검증
        if (trimmedValue.length < 2 || trimmedValue.length > 100) {
            return { isValid: false, message: this.ERROR_MESSAGES.vocabulary.length };
        }

        return { isValid: true, message: '' };
    }

    /**
     * 단어 중복 여부 검증 (비동기)
     * @param {string} value - 검증할 영단어
     * @param {Function} checkDuplicateFunc - 중복 확인 API 호출 함수
     * @param {string} [currentId=null] - 현재 수정 중인 단어 ID (수정 시에만 사용)
     * @returns {Promise<{isValid: boolean, message: string}>} - 유효성 검증 결과
     */
    async validateVocabularyDuplicate(value, checkDuplicateFunc, currentId = null) {
        try {
            // 기본 유효성 검증
            const baseValidation = this.validateVocabulary(value);
            if (!baseValidation.isValid) {
                return baseValidation;
            }

            // 중복 확인 함수 호출
            const { exists } = await checkDuplicateFunc(value, currentId);

            if (exists) {
                return { isValid: false, message: this.ERROR_MESSAGES.vocabulary.duplicate };
            }

            return { isValid: true, message: '' };
        } catch (error) {
            console.error('중복 검사 중 오류:', error);
            return { isValid: false, message: '중복 검사 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 뜻(의미) 유효성 검증
     * @param {string} value - 검증할 단어 뜻
     * @param {Object} [options={}] - 추가 옵션
     * @param {boolean} [options.allowEmpty=false] - 빈 값 허용 여부
     * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
     */
    validateMeaning(value, options = {}) {
        const { allowEmpty = false } = options;

        // 빈 값 처리
        if (!value || value.trim() === '') {
            return allowEmpty
                ? { isValid: true, message: '' }
                : { isValid: false, message: this.ERROR_MESSAGES.meaning.required };
        }

        const trimmedValue = value.trim();

        // 패턴 검증
        if (!this.PATTERNS.meaning.test(trimmedValue)) {
            return { isValid: false, message: this.ERROR_MESSAGES.meaning.pattern };
        }

        // 길이 검증
        if (trimmedValue.length < 1 || trimmedValue.length > 100) {
            return { isValid: false, message: this.ERROR_MESSAGES.meaning.length };
        }

        return { isValid: true, message: '' };
    }

    /**
     * 힌트 유효성 검증
     * @param {string} value - 검증할 힌트
     * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
     */
    validateHint(value) {
        // 힌트는 옵션이므로 빈 값 허용
        if (!value || value.trim() === '') {
            return { isValid: true, message: '' };
        }

        // 길이 검증
        if (value.trim().length > 100) {
            return { isValid: false, message: this.ERROR_MESSAGES.hint.length };
        }

        return { isValid: true, message: '' };
    }

    /**
     * 난이도 유효성 검증
     * @param {number|string} value - 검증할 난이도 (1-5)
     * @param {Object} [options={}] - 추가 옵션
     * @param {boolean} [options.allowEmpty=false] - 빈 값 허용 여부
     * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
     */
    validateDifficulty(value, options = {}) {
        const { allowEmpty = false } = options;

        // 빈 값 처리
        if (value === null || value === undefined || value === '') {
            return allowEmpty
                ? { isValid: true, message: '' }
                : { isValid: false, message: this.ERROR_MESSAGES.difficulty.required };
        }

        // 숫자로 변환
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;

        // 범위 검증
        if (isNaN(numValue) || numValue < 1 || numValue > 5) {
            return { isValid: false, message: this.ERROR_MESSAGES.difficulty.range };
        }

        return { isValid: true, message: '' };
    }

    /**
     * 폼 데이터 전체 유효성 검증
     * @param {Object} data - 검증할 데이터 객체 {vocabulary, meaning, hint, difficulty}
     * @param {Object} [options={}] - 추가 옵션
     * @param {boolean} [options.showToast=false] - 토스트 메시지 표시 여부
     * @param {Function} [options.checkDuplicate] - 중복 확인 함수 (async)
     * @param {string} [options.currentId=null] - 현재 수정 중인 단어 ID
     * @returns {Promise<boolean>} - 모든 필드가 유효하면 true, 아니면 false
     */
    async validateWordForm(data, options = {}) {
        const { showToast = false, checkDuplicate, currentId } = options;

        // 영단어 검증
        const vocabularyResult = this.validateVocabulary(data.vocabulary);
        if (!vocabularyResult.isValid) {
            if (showToast && window.showErrorToast) {
                window.showErrorToast(vocabularyResult.message, { title: '입력 오류' });
            }
            return false;
        }

        // 중복 검증 (필요한 경우)
        if (checkDuplicate) {
            const duplicateResult = await this.validateVocabularyDuplicate(
                data.vocabulary,
                checkDuplicate,
                currentId
            );

            if (!duplicateResult.isValid) {
                if (showToast && window.showErrorToast) {
                    window.showErrorToast(duplicateResult.message, { title: '중복 오류' });
                }
                return false;
            }
        }

        // 뜻 검증
        const meaningResult = this.validateMeaning(data.meaning);
        if (!meaningResult.isValid) {
            if (showToast && window.showErrorToast) {
                window.showErrorToast(meaningResult.message, { title: '입력 오류' });
            }
            return false;
        }

        // 힌트 검증
        const hintResult = this.validateHint(data.hint);
        if (!hintResult.isValid) {
            if (showToast && window.showErrorToast) {
                window.showErrorToast(hintResult.message, { title: '입력 오류' });
            }
            return false;
        }

        // 난이도 검증
        const difficultyResult = this.validateDifficulty(data.difficulty);
        if (!difficultyResult.isValid) {
            if (showToast && window.showErrorToast) {
                window.showErrorToast(difficultyResult.message, { title: '입력 오류' });
            }
            return false;
        }

        return true;
    }

    /**
     * UI 요소 유효성 상태 업데이트
     * @param {HTMLElement} element - 업데이트할 DOM 요소
     * @param {boolean|null} isValid - 유효성 여부 (null이면 초기 상태)
     * @param {string} message - 오류 메시지
     */
    updateFieldStatus(element, isValid, message = '') {
        if (!element) return;

        // 입력 필드 컨테이너 찾기
        const formGroup = element.closest('.form-group, .input-group');
        if (!formGroup) return;

        // 피드백 요소 찾기
        const invalidFeedback = formGroup.querySelector('.invalid-feedback');
        const validFeedback = formGroup.querySelector('.valid-feedback');

        // 초기 상태(null)인 경우 모든 클래스 제거
        if (isValid === null) {
            element.classList.remove('is-valid', 'is-invalid');

            if (invalidFeedback) {
                invalidFeedback.style.display = 'none';
            }

            if (validFeedback) {
                validFeedback.style.display = 'none';
            }

            return;
        }

        // 유효성 여부에 따라 클래스 토글
        element.classList.toggle('is-valid', isValid);
        element.classList.toggle('is-invalid', !isValid);

        // 피드백 메시지 업데이트
        if (invalidFeedback && message) {
            invalidFeedback.textContent = message;
            invalidFeedback.style.display = !isValid ? 'block' : 'none';
        }

        if (validFeedback) {
            validFeedback.style.display = isValid ? 'block' : 'none';
        }
    }
}

// 싱글톤 인스턴스 생성
const validationService = ValidationService.getInstance();

// 전역 함수로 노출 (편의성 향상)
/**
 * 영단어 유효성 검증 (전역 함수)
 * @param {string} value - 검증할 영단어
 * @param {Object} [options={}] - 추가 옵션
 * @returns {boolean} - 유효성 여부
 */
window.validateVocabulary = (value, options = {}) => {
    const result = validationService.validateVocabulary(value, options);

    if (options.showToast && !result.isValid && window.showErrorToast) {
        window.showErrorToast(result.message, { title: '입력 오류' });
    }

    if (options.element) {
        validationService.updateFieldStatus(options.element, result.isValid, result.message);
    }

    return result.isValid;
};

/**
 * 단어 뜻 유효성 검증 (전역 함수)
 * @param {string} value - 검증할 단어 뜻
 * @param {Object} [options={}] - 추가 옵션
 * @returns {boolean} - 유효성 여부
 */
window.validateMeaning = (value, options = {}) => {
    const result = validationService.validateMeaning(value, options);

    if (options.showToast && !result.isValid && window.showErrorToast) {
        window.showErrorToast(result.message, { title: '입력 오류' });
    }

    if (options.element) {
        validationService.updateFieldStatus(options.element, result.isValid, result.message);
    }

    return result.isValid;
};

/**
 * 힌트 유효성 검증 (전역 함수)
 * @param {string} value - 검증할 힌트
 * @param {Object} [options={}] - 추가 옵션
 * @returns {boolean} - 유효성 여부
 */
window.validateHint = (value, options = {}) => {
    const result = validationService.validateHint(value);

    if (options.showToast && !result.isValid && window.showErrorToast) {
        window.showErrorToast(result.message, { title: '입력 오류' });
    }

    if (options.element) {
        validationService.updateFieldStatus(options.element, result.isValid, result.message);
    }

    return result.isValid;
};

/**
 * 난이도 유효성 검증 (전역 함수)
 * @param {number|string} value - 검증할 난이도
 * @param {Object} [options={}] - 추가 옵션
 * @returns {boolean} - 유효성 여부
 */
window.validateDifficulty = (value, options = {}) => {
    const result = validationService.validateDifficulty(value, options);

    if (options.showToast && !result.isValid && window.showErrorToast) {
        window.showErrorToast(result.message, { title: '입력 오류' });
    }

    if (options.element) {
        validationService.updateFieldStatus(options.element, result.isValid, result.message);
    }

    return result.isValid;
};

/**
 * 폼 전체 유효성 검증 (전역 함수)
 * @param {Object} data - 검증할 데이터 객체
 * @param {Object} [options={}] - 추가 옵션
 * @returns {Promise<boolean>} - 유효성 여부
 */
window.validateWordForm = async (data, options = {}) => {
    return validationService.validateWordForm(data, options);
};

// ValidationService 전역 노출
window.ValidationService = validationService;