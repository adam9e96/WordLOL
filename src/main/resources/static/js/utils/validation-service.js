/**
 * ValidationService - 사용자 입력 유효성 검증 모듈
 * ES 모듈 시스템을 사용한 유효성 검사 라이브러리
 * 단어, 뜻, 힌트, 난이도 등 입력값의 유효성을 검증하는 기능을 제공
 */
const ERROR_MESSAGES = {
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
    },
    wordbook: {
        name: {
            required: '단어장 이름을 입력해주세요.',
            length: '단어장 이름은 2자 이상 50자 이하로 입력해주세요.'
        },
        description: {
            required: '단어장 설명을 입력해주세요.',
            length: '단어장 설명은 10자 이상 500자 이하로 입력해주세요.'
        },
        category: {
            required: '카테고리를 선택해주세요.',
            invalid: '유효하지 않은 카테고리입니다.'
        },
        words: {
            required: '최소 1개 이상의 단어가 필요합니다.',
            max: '단어장에는 최대 100개의 단어만 추가할 수 있습니다.'
        }
    }
};
const PATTERNS = {
    vocabulary: /^[a-zA-Z\s\-]+$/,
    meaning: /^[가-힣a-zA-Z\s,\-~]+$/
};

/**
 * 영단어 유효성 검증
 * @param {string} value - 검증할 영단어
 * @param {Object} [options={}] - 추가 옵션
 * @param {boolean} [options.allowEmpty=false] - 빈 값 허용 여부
 * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
 */
export function validateVocabulary(value, options = {}) {
    const {allowEmpty = false} = options;

    // 빈 값 처리
    if (!value || value.trim() === '') {
        return allowEmpty
            ? {isValid: true, message: ''}
            : {isValid: false, message: ERROR_MESSAGES.vocabulary.required};
    }

    // 정규식 패턴 검증
    const trimmedValue = value.trim();

    // 패턴 검증
    if (!PATTERNS.vocabulary.test(trimmedValue)) {
        return {isValid: false, message: ERROR_MESSAGES.vocabulary.required};
    }
    // 길이 검증
    if (trimmedValue.length < 2 || trimmedValue.length > 100) {
        return {isValid: false, message: ERROR_MESSAGES.vocabulary.length};
    }
    // 모든 검증 통과 시
    return {isValid: true, message: ''};
}


/**
 * 뜻(의미) 유효성 검증
 * @param {string} value - 검증할 단어 뜻
 * @param {Object} [options={}] - 추가 옵션
 * @param {boolean} [options.allowEmpty=false] - 빈 값 허용 여부
 * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
 */
export function validateMeaning(value, options = {}) {
    const {allowEmpty = false} = options;

    // 빈 값 처리
    if (!value || value.trim() === '') {
        return allowEmpty
            ? {isValid: true, message: ''}
            : {isValid: false, message: ERROR_MESSAGES.meaning.required};
    }

    const trimmedValue = value.trim();

    // 패턴 검증
    if (!PATTERNS.meaning.test(trimmedValue)) {
        return {isValid: false, message: ERROR_MESSAGES.meaning.pattern};
    }

    // 길이 검증
    if (trimmedValue.length < 1 || trimmedValue.length > 100) {
        return {isValid: false, message: ERROR_MESSAGES.meaning.length};
    }

    return {isValid: true, message: ''};
}

/**
 * 힌트 유효성 검증
 * @param {string} value - 검증할 힌트
 * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
 */
export function validateHint(value) {
    // 힌트는 옵션이므로 빈 값 허용
    if (!value || value.trim() === '') {
        return {isValid: true, message: ''};
    }

    // 길이 검증
    if (value.trim().length > 100) {
        return {isValid: false, message: ERROR_MESSAGES.hint.length};
    }

    return {isValid: true, message: ''};
}

/**
 * 난이도 유효성 검증
 * @param {number|string} value - 검증할 난이도 (1-5)
 * @param {Object} [options={}] - 추가 옵션
 * @param {boolean} [options.allowEmpty=false] - 빈 값 허용 여부
 * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
 */
export function validateDifficulty(value, options = {}) {
    const {allowEmpty = false} = options;

    // 빈 값 처리
    if (value === null || value === undefined || value === '') {
        return allowEmpty
            ? {isValid: true, message: ''}
            : {isValid: false, message: ERROR_MESSAGES.difficulty.required};
    }

    // 숫자로 변환
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;

    // 범위 검증
    if (isNaN(numValue) || numValue < 1 || numValue > 5) {
        return {isValid: false, message: ERROR_MESSAGES.difficulty.range};
    }

    return {isValid: true, message: ''};
}

/**
 * 단어장 이름 유효성 검증
 * @param {string} value - 검증할 단어장 이름
 * @param {Object} [options={}] - 추가 옵션
 * @param {boolean} [options.allowEmpty=false] - 빈 값 허용 여부
 * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
 */
export function validateWordBookName(value, options = {}) {
    const {allowEmpty = false} = options;

    // 빈 값 처리
    if (!value || value.trim() === '') {
        return allowEmpty
            ? {isValid: true, message: ''}
            : {isValid: false, message: ERROR_MESSAGES.wordbook.name.required};
    }

    const trimmedValue = value.trim();

    // 길이 검증 (2-50자)
    if (trimmedValue.length < 2 || trimmedValue.length > 50) {
        return {isValid: false, message: ERROR_MESSAGES.wordbook.name.length};
    }

    return {isValid: true, message: ''};
}

/**
 * 단어장 설명 유효성 검증
 * @param {string} value - 검증할 단어장 설명
 * @param {Object} [options={}] - 추가 옵션
 * @param {boolean} [options.allowEmpty=false] - 빈 값 허용 여부
 * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
 */
export function validateWordBookDescription(value, options = {}) {
    const {allowEmpty = false} = options;

    // 빈 값 처리
    if (!value || value.trim() === '') {
        return allowEmpty
            ? {isValid: true, message: ''}
            : {isValid: false, message: ERROR_MESSAGES.wordbook.description.required};
    }

    const trimmedValue = value.trim();

    // 길이 검증 (10-500자)
    if (trimmedValue.length < 10 || trimmedValue.length > 500) {
        return {isValid: false, message: ERROR_MESSAGES.wordbook.description.length};
    }

    return {isValid: true, message: ''};
}

/**
 * 단어장 카테고리 유효성 검증
 * @param {string} value - 검증할 카테고리
 * @param {Object} [options={}] - 추가 옵션
 * @param {boolean} [options.allowEmpty=false] - 빈 값 허용 여부
 * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
 */
export function validateWordBookCategory(value, options = {}) {
    const {allowEmpty = false} = options;

    // 빈 값 처리
    if (!value || value.trim() === '') {
        return allowEmpty
            ? {isValid: true, message: ''}
            : {isValid: false, message: ERROR_MESSAGES.wordbook.category.required};
    }

    // 유효한 카테고리 값 확인
    const validCategories = ['TOEIC', 'TOEFL', 'CSAT', 'CUSTOM'];
    if (!validCategories.includes(value)) {
        return {isValid: false, message: ERROR_MESSAGES.wordbook.category.invalid};
    }

    return {isValid: true, message: ''};
}

/**
 * 단어장 단어 목록 유효성 검증
 * @param {Array} words - 검증할 단어 목록
 * @returns {{isValid: boolean, message: string}} - 유효성 검증 결과
 */
export function validateWordBookWords(words) {
    // 단어 목록이 배열인지 확인
    if (!Array.isArray(words)) {
        return {isValid: false, message: ERROR_MESSAGES.wordbook.words.required};
    }

    // 단어 목록이 비어있는지 확인
    if (words.length === 0) {
        return {isValid: false, message: ERROR_MESSAGES.wordbook.words.required};
    }

    // 단어 목록 최대 개수 검증
    if (words.length > 100) {
        return {isValid: false, message: ERROR_MESSAGES.wordbook.words.max};
    }

    // 각 단어 유효성 검사
    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // 단어 필수 필드 검증
        const vocabularyResult = validateVocabulary(word.vocabulary);
        if (!vocabularyResult.isValid) {
            return {
                isValid: false,
                message: `${i + 1}번째 단어: ${vocabularyResult.message}`,
                index: i
            };
        }

        const meaningResult = validateMeaning(word.meaning);
        if (!meaningResult.isValid) {
            return {
                isValid: false,
                message: `${i + 1}번째 단어: ${meaningResult.message}`,
                index: i
            };
        }

        // 힌트는 선택 사항이지만, 입력된 경우 유효성 검사
        if (word.hint) {
            const hintResult = validateHint(word.hint);
            if (!hintResult.isValid) {
                return {
                    isValid: false,
                    message: `${i + 1}번째 단어: ${hintResult.message}`,
                    index: i
                };
            }
        }

        // 난이도 검증
        const difficultyResult = validateDifficulty(word.difficulty);
        if (!difficultyResult.isValid) {
            return {
                isValid: false,
                message: `${i + 1}번째 단어: ${difficultyResult.message}`,
                index: i
            };
        }
    }

    return {isValid: true, message: ''};
}

/**
 * 단어 폼 전체 유효성 검사
 * @param {Object} data - 단어 데이터
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.showToast - 토스트 메시지 표시 여부
 * @param {Function} options.checkDuplicate - 중복 검사 콜백 함수
 * @returns {Promise<boolean>} 유효성 검사 결과
 */
export async function validateWordForm(data, options = {}) {
    const {showToast = false, checkDuplicate = null} = options;

    // 영단어 검증
    const vocabularyResult = validateVocabulary(data.vocabulary);
    if (!vocabularyResult.isValid) {
        if (showToast && window.showErrorToast) {
            window.showErrorToast(vocabularyResult.message, {title: '입력 오류'});
        }
        return false;
    }
    if (checkDuplicate) {
        try {
            const duplicateResult = await checkDuplicate(data.vocabulary);
            if (duplicateResult.exists) {
                if (showToast && window.showErrorToast) {
                    window.showErrorToast('이미 등록된 단어입니다.', {title: '중복 오류'});
                }
                return false;
            }
        } catch (error) {
            console.error('중복 검사 중 오류:', error);
            return false;
        }
    }

    // 뜻 검증
    const meaningResult = validateMeaning(data.meaning);
    if (!meaningResult.isValid) {
        if (showToast && window.showErrorToast) {
            window.showErrorToast(meaningResult.message, {title: '입력 오류'});
        }
        return false;
    }

    // 힌트 검증
    const hintResult = validateHint(data.hint);
    if (!hintResult.isValid) {
        if (showToast && window.showErrorToast) {
            window.showErrorToast(hintResult.message, {title: '입력 오류'});
        }
        return false;
    }

    // 난이도 검증
    const difficultyResult = validateDifficulty(data.difficulty);
    if (!difficultyResult.isValid) {
        if (showToast && window.showErrorToast) {
            window.showErrorToast(difficultyResult.message, {title: '입력 오류'});
        }
        return false;
    }

    return true;
}

/**
 * 단어장 전체 유효성 검사
 * @param {Object} data - 단어장 데이터
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.showToast - 토스트 메시지 표시 여부
 * @returns {Promise<boolean>} 유효성 검사 결과
 */
export async function validateWordBookForm(data, options = {}) {
    const {showToast = false} = options;

    // 단어장 이름 검증
    const nameResult = validateWordBookName(data.name);
    if (!nameResult.isValid) {
        if (showToast && window.showErrorToast) {
            window.showErrorToast(nameResult.message, {title: '입력 오류'});
        }
        return false;
    }

    // 단어장 설명 검증
    const descriptionResult = validateWordBookDescription(data.description);
    if (!descriptionResult.isValid) {
        if (showToast && window.showErrorToast) {
            window.showErrorToast(descriptionResult.message, {title: '입력 오류'});
        }
        return false;
    }

    // 카테고리 검증
    const categoryResult = validateWordBookCategory(data.category);
    if (!categoryResult.isValid) {
        if (showToast && window.showErrorToast) {
            window.showErrorToast(categoryResult.message, {title: '입력 오류'});
        }
        return false;
    }

    // 단어 목록 검증
    const wordsResult = validateWordBookWords(data.words);
    if (!wordsResult.isValid) {
        if (showToast && window.showErrorToast) {
            window.showErrorToast(wordsResult.message, {title: '입력 오류'});
        }

        // 에러가 발생한 단어 행 포커스 처리
        if (wordsResult.index !== undefined && options.focusField) {
            options.focusField(wordsResult.index);
        }

        return false;
    }

    return true;
}

/**
 * UI 요소 유효성 상태 업데이트
 * @param {HTMLElement} element - 업데이트할 DOM 요소
 * @param {boolean|null} isValid - 유효성 여부 (null 이면 초기 상태)
 * @param {string} message - 오류 메시지
 */
export function updateFieldStatus(element, isValid, message = '') {
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
    if (invalidFeedback && !isValid) {
        // 메시지 텍스트만 업데이트 (아이콘은 유지)
        const messageSpan = invalidFeedback.querySelector('span');
        if (messageSpan && message) {
            messageSpan.textContent = message;
        } else if (message) {
            // span 이 없는 경우 전체 내용 설정
            invalidFeedback.innerHTML = `<i class="bi bi-exclamation-triangle"></i> <span>${message}</span>`;
        }
        invalidFeedback.style.display = 'block';
    } else if (invalidFeedback) {
        invalidFeedback.style.display = 'none';
    }

    // 유효한 피드백 표시/숨김
    if (validFeedback) {
        validFeedback.style.display = isValid ? 'block' : 'none';
    }
}