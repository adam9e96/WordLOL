class WordRegistrationApp {
    constructor() {
        // API 기본 URL
        this.API_BASE_URL = '/api/v1/words';

        // 처리 상태 플래그
        this.isProcessing = false;

        // 모듈 초기화
        this.uiManager = new UIManager();
        this.validationManager = new ValidationManager();
        this.apiService = new ApiService(this.API_BASE_URL);
        this.formManager = new FormManager();
        this.animationManager = new AnimationManager();
    }

    /**
     * 애플리케이션 시작
     */
    initialize() {
        // DOM이 완전히 로드된 후 초기 애니메이션 실행
        this.animationManager.animatePageLoad();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 입력 필드에 초점 맞추기
        document.getElementById('vocabulary').focus();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 단어 등록 폼 제출 이벤트
        document.getElementById('wordForm').addEventListener('submit', (e) => this.handleSubmit(e));

        // 취소 버튼 클릭 이벤트
        document.getElementById('cancelBtn').addEventListener('click', () => this.handleCancel());

        // 입력 필드 타이핑 애니메이션
        this.setupTypingAnimations();

        // 실시간 유효성 검사
        this.setupValidationListeners();
    }

    /**
     * 입력 필드 타이핑 애니메이션 설정
     */
    setupTypingAnimations() {
        const inputFields = document.querySelectorAll('.form-input');

        inputFields.forEach(field => {
            field.addEventListener('input', () => {
                this.animationManager.animateTyping(field);
            });

            // 포커스 이벤트에도 애니메이션 추가
            field.addEventListener('focus', () => {
                this.animationManager.animateFocus(field);
            });
        });
    }

    /**
     * 실시간 유효성 검사 리스너 설정
     */
    setupValidationListeners() {
        // 초기 상태에서는 오류 메시지 숨기기
        document.querySelectorAll('.input-error-feedback').forEach(el => {
            el.style.display = 'none';
        });

        // 영단어 입력 필드 유효성 검사
        const vocabularyField = document.getElementById('vocabulary');
        vocabularyField.addEventListener('blur', (e) => {
            const result = this.validationManager.validateVocabulary(e.target.value);
            this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
        });
        vocabularyField.addEventListener('input', (e) => {
            if (e.target.value.trim() !== '') {
                const result = this.validationManager.validateVocabulary(e.target.value);
                this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
            }
        });

        // 의미 입력 필드 유효성 검사
        const meaningField = document.getElementById('meaning');
        meaningField.addEventListener('blur', (e) => {
            const result = this.validationManager.validateMeaning(e.target.value);
            this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
        });
        meaningField.addEventListener('input', (e) => {
            if (e.target.value.trim() !== '') {
                const result = this.validationManager.validateMeaning(e.target.value);
                this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
            }
        });

        // 힌트 입력 필드 유효성 검사
        const hintField = document.getElementById('hint');
        hintField.addEventListener('blur', (e) => {
            const result = this.validationManager.validateHint(e.target.value);
            this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
        });
        hintField.addEventListener('input', (e) => {
            if (e.target.value.trim() !== '') {
                const result = this.validationManager.validateHint(e.target.value);
                this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
            }
        });
    }

    /**
     * 폼 제출 처리
     * @param {Event} e - 제출 이벤트
     */
    async handleSubmit(e) {
        e.preventDefault();

        if (this.isProcessing) return;

        const wordData = this.formManager.getFormData();

        try {
            this.isProcessing = true;
            this.animationManager.animateSubmitStart();

            // 폼 데이터 유효성 검사
            if (!await this.formManager.validateFormData(wordData)) {
                this.isProcessing = false;
                this.animationManager.animateSubmitEnd(false);
                return;
            }

            // 단어 등록 API 호출
            await this.apiService.registerWord(wordData);

            // 성공 알림 및 애니메이션
            window.showSuccessToast('단어가 성공적으로 등록되었습니다.', {title: '등록 완료'});
            this.animationManager.animateSubmitEnd(true);

            // 성공 후 리디렉션
            setTimeout(() => {
                window.location.href = '/word/list';
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            // 에러 토스트 메시지 수정
            window.showErrorToast(error.message || '단어 등록에 실패했습니다.', {
                title: '등록 실패'
            });

            this.animationManager.animateSubmitEnd(false);
            this.isProcessing = false;
        }
    }

    /**
     * 취소 버튼 처리
     */
    handleCancel() {
        this.animationManager.animateExit(() => {
            history.back();
        });
    }
}

/**
 * API 통신 서비스
 */
class ApiService {
    /**
     * @param {string} baseUrl - API 기본 URL
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * 단어 등록 API 호출
     * @param {Object} wordData - 등록할 단어 데이터
     * @returns {Promise<Object>} API 응답
     */
    async registerWord(wordData) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(wordData)
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.errors?.join('\n') || '단어 등록에 실패했습니다.');
        }

        return response.json();
    }

    /**
     * 단어 중복 검사 API 호출
     * @param {string} vocabulary - 검사할 단어
     * @returns {Promise<{exists: boolean}>} 중복 여부
     */
    async checkDuplicate(vocabulary) {
        try {
            const response = await fetch(`${this.baseUrl}/check-duplicate?vocabulary=${encodeURIComponent(vocabulary)}`);
            if (!response.ok) throw new Error('중복 검사 중 오류가 발생했습니다.');
            return response.json();
        } catch (error) {
            console.error('Duplicate check error:', error);
            throw error;
        }
    }
}

/**
 * UIManager - UI 관리 클래스
 */
class UIManager {

    /**
     * 입력 필드 상태 업데이트
     * @param {HTMLElement} element - 입력 필드 요소
     * @param {boolean|null} isValid - 유효성 여부 (null이면 초기 상태)
     * @param {string} message - 오류 메시지
     */
    updateFieldStatus(element, isValid, message = '') {
        // 입력 필드 컨테이너 찾기
        const formGroup = element.closest('.form-group');

        // 피드백 요소 찾기
        const feedback = formGroup.querySelector('.input-error-feedback');

        // 유효성 아이콘 요소 찾기 또는 생성
        let validIcon = formGroup.querySelector('.valid-feedback-icon');
        if (!validIcon) {
            validIcon = document.createElement('div');
            validIcon.className = 'valid-feedback-icon position-absolute end-0 top-50 translate-middle-y me-3 d-none';
            validIcon.innerHTML = '<i class="bi bi-check-circle-fill text-success fs-5"></i>';

            // 입력 필드의 부모 요소에 position-relative 추가하고 아이콘 추가
            const inputWrapper = element.parentElement;
            if (!inputWrapper.classList.contains('position-relative')) {
                inputWrapper.classList.add('position-relative');
            }
            inputWrapper.appendChild(validIcon);
        }

        // 초기 상태(null)인 경우 모든 클래스 제거
        if (isValid === null) {
            element.classList.remove('is-valid', 'is-invalid');
            validIcon.classList.add('d-none');
            if (feedback) {
                feedback.style.display = 'none';
            }
            return;
        }

        // 유효성 여부에 따라 클래스 토글
        element.classList.toggle('is-valid', isValid);
        element.classList.toggle('is-invalid', !isValid);

        // 유효성 아이콘 토글
        if (isValid) {
            validIcon.classList.remove('d-none');
        } else {
            validIcon.classList.add('d-none');
        }

        // 피드백 메시지 업데이트
        if (feedback) {
            feedback.textContent = message;
            feedback.style.display = !isValid && message ? 'block' : 'none';
        }
    }
}

/**
 * 유효성 검사 관리 클래스
 */
class ValidationManager {
    constructor() {
        // 에러 메시지 상수
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
            }
        };

        // 정규식 패턴
        this.PATTERNS = {
            vocabulary: /^[a-zA-Z\s\-]+$/,
            meaning: /^[가-힣a-zA-Z\s,\-~]+$/
        };
    }

    /**
     * 영단어 유효성 검사
     * @param {string} value - 영단어
     * @returns {{isValid: boolean, message: string}} 유효성 검사 결과
     */
    validateVocabulary(value) {
        // 입력값이 없으면 초기 상태로 간주 (첫 로드 시 메시지 표시 안 함)
        if (value === '') {
            return {
                isValid: null,
                message: ''
            };
        }

        value = value.trim();
        if (!value) {
            return {isValid: false, message: this.ERROR_MESSAGES.vocabulary.required};
        }
        if (!this.PATTERNS.vocabulary.test(value)) {
            return {isValid: false, message: this.ERROR_MESSAGES.vocabulary.pattern};
        }
        if (value.length < 2 || value.length > 100) {
            return {isValid: false, message: this.ERROR_MESSAGES.vocabulary.length};
        }
        return {isValid: true, message: ''};
    }

    /**
     * 의미 유효성 검사
     * @param {string} value - 의미
     * @returns {{isValid: boolean, message: string}} 유효성 검사 결과
     */
    validateMeaning(value) {
        // 입력값이 없으면 초기 상태로 간주 (첫 로드 시 메시지 표시 안 함)
        if (value === '') {
            return {isValid: null, message: ''};
        }

        value = value.trim();
        if (!value) {
            return {isValid: false, message: this.ERROR_MESSAGES.meaning.required};
        }
        if (!this.PATTERNS.meaning.test(value)) {
            return {isValid: false, message: this.ERROR_MESSAGES.meaning.pattern};
        }
        if (value.length < 1 || value.length > 100) {
            return {isValid: false, message: this.ERROR_MESSAGES.meaning.length};
        }
        return {isValid: true, message: ''};
    }

    /**
     * 힌트 유효성 검사
     * @param {string} value - 힌트
     * @returns {{isValid: boolean, message: string}} 유효성 검사 결과
     */
    validateHint(value) {
        if (value === '') {
            return {isValid: null, message: ''};
        }

        if (value && value.length > 100) {
            return {isValid: false, message: this.ERROR_MESSAGES.hint.length};
        }
        return {isValid: true, message: ''};
    }
}

/**
 * 폼 관리 클래스
 */
class FormManager {
    constructor() {
        this.validationManager = new ValidationManager();
        this.uiManager = new UIManager();
        this.apiService = new ApiService('/api/v1/words');

        // 입력 필드 요소 참조
        this.inputs = {
            vocabulary: document.getElementById('vocabulary'),
            meaning: document.getElementById('meaning'),
            hint: document.getElementById('hint')
        };
    }

    /**
     * 폼 데이터 가져오기
     * @returns {{vocabulary: string, meaning: string, hint: string, difficulty: number}} 폼 데이터
     */
    getFormData() {
        return {
            vocabulary: this.inputs.vocabulary.value.trim(),
            meaning: this.inputs.meaning.value.trim(),
            hint: this.inputs.hint.value.trim(),
            difficulty: parseInt(document.querySelector('input[name="difficulty"]:checked')?.value || 3)
        };
    }

    /**
     * 폼 데이터 유효성 검사
     * @param {Object} data - 폼 데이터
     * @returns {Promise<boolean>} 유효성 여부
     */
    async validateFormData(data) {
        // 입력 필드 참조 업데이트 (필요한 경우)
        const vocabularyField = document.getElementById('vocabulary');
        const meaningField = document.getElementById('meaning');
        const hintField = document.getElementById('hint');

        // 폼 제출 시 빈 값 검사
        if (!data.vocabulary.trim()) {
            this.uiManager.updateFieldStatus(vocabularyField, false,
                this.validationManager.ERROR_MESSAGES.vocabulary.required);

            // 명시적으로 에러 토스트 표시
            window.showErrorToast(this.validationManager.ERROR_MESSAGES.vocabulary.required, {
                title: '입력 오류'
            });
            vocabularyField.focus();
            return false;
        }

        if (!data.meaning.trim()) {
            this.uiManager.updateFieldStatus(meaningField, false,  // 수정: meaningField 사용
                this.validationManager.ERROR_MESSAGES.meaning.required);

            window.showErrorToast(this.validationManager.ERROR_MESSAGES.meaning.required, {
                title: '입력 오류'
            });
            meaningField.focus();
            return false;
        }

        // 영단어 유효성 검사
        const vocabularyValidation = this.validationManager.validateVocabulary(data.vocabulary);
        if (!vocabularyValidation.isValid) {
            this.uiManager.updateFieldStatus(vocabularyField, false, vocabularyValidation.message);

            // 에러 토스트 메시지 수정
            window.showErrorToast(vocabularyValidation.message.toString(), {
                title: '입력 오류'
            });

            vocabularyField.focus();
            return false;
        } else {
            this.uiManager.updateFieldStatus(vocabularyField, true, '');
        }

        // 의미 유효성 검사
        const meaningValidation = this.validationManager.validateMeaning(data.meaning);
        if (!meaningValidation.isValid) {
            this.uiManager.updateFieldStatus(meaningField, false, meaningValidation.message);

            // 에러 토스트 메시지 수정
            window.showErrorToast(meaningValidation.message.toString(), {
                title: '입력 오류'
            });

            meaningField.focus();
            return false;
        } else {
            this.uiManager.updateFieldStatus(meaningField, true, '');
        }

        // 힌트 유효성 검사
        const hintValidation = this.validationManager.validateHint(data.hint);
        if (!hintValidation.isValid) {
            this.uiManager.updateFieldStatus(hintField, false, hintValidation.message);

            // 에러 토스트 메시지 수정
            window.showErrorToast(hintValidation.message, {
                title: '입력 오류'
            });

            hintField.focus();
            return false;
        } else {
            this.uiManager.updateFieldStatus(hintField, true, '');
        }

        // 중복 검사
        try {
            const {exists} = await this.apiService.checkDuplicate(data.vocabulary);
            if (exists) {
                this.uiManager.updateFieldStatus(vocabularyField, false, this.validationManager.ERROR_MESSAGES.vocabulary.duplicate);

                // 에러 토스트 메시지 수정
                window.showErrorToast(this.validationManager.ERROR_MESSAGES.vocabulary.duplicate, {
                    title: '중복 단어'
                });

                vocabularyField.focus();
                return false;
            }
        } catch (error) {
            // 에러 토스트 메시지 수정
            window.showErrorToast(error.message || '중복 검사 중 오류가 발생했습니다.', {
                title: '서버 오류'
            });

            return false;
        }

        return true;
    }
}

/**
 * 애니메이션 관리 클래스
 */
class AnimationManager {
    constructor() {
        // anime.js가 로드되었는지 확인
        this.isAnimeAvailable = typeof anime !== 'undefined';
    }

    /**
     * 페이지 로드 애니메이션
     */
    animatePageLoad() {
        if (!this.isAnimeAvailable) return;

        // 폼 컨테이너 애니메이션
        anime({
            targets: '.form-container',
            opacity: [0, 1],
            translateY: [20, 0],
            easing: 'easeOutExpo',
            duration: 800,
            delay: 300
        });

        // 제목 애니메이션
        anime({
            targets: '.page-title',
            opacity: [0, 1],
            translateX: [-20, 0],
            easing: 'easeOutExpo',
            duration: 200,
            delay: 100
        });

        // 폼 그룹 순차 애니메이션
        anime({
            targets: '.form-group',
            opacity: [0, 1],
            translateY: [15, 0],
            easing: 'easeOutExpo',
            duration: 200,
            delay: anime.stagger(100, {start: 700})
        });

        // 버튼 애니메이션
        anime({
            targets: '.form-controls .btn',
            opacity: [0, 1],
            translateY: [10, 0],
            easing: 'easeOutExpo',
            duration: 200,
            delay: anime.stagger(100, {start: 1200})
        });
    }

    /**
     * 타이핑 애니메이션
     * @param {HTMLElement} element - 입력 필드 요소
     */
    animateTyping(element) {
        if (!this.isAnimeAvailable) return;

        anime({
            targets: element,
            backgroundColor: [
                {value: 'rgba(234, 221, 255, 0.5)', duration: 200},
                {value: 'rgba(255, 255, 255, 1)', duration: 300}
            ],
            borderColor: [
                {value: '#6750A4', duration: 200},
                {value: '', duration: 500}
            ],
            easing: 'easeInOutQuad'
        });
    }

    /**
     * 포커스 애니메이션
     * @param {HTMLElement} element - 입력 필드 요소
     */
    animateFocus(element) {
        if (!this.isAnimeAvailable) return;

        anime({
            targets: element,
            scale: [1, 1.02, 1],
            duration: 400,
            easing: 'easeOutElastic(1, .8)'
        });
    }

    /**
     * 제출 시작 애니메이션
     */
    animateSubmitStart() {
        if (!this.isAnimeAvailable) return;

        // 등록 버튼 로딩 효과
        const submitBtn = document.querySelector('.btn-register-word');
        submitBtn.disabled = true;

        anime({
            targets: submitBtn,
            scale: 0.95,
            opacity: 0.8,
            duration: 300,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * 제출 완료 애니메이션
     * @param {boolean} success - 성공 여부
     */
    animateSubmitEnd(success) {
        if (!this.isAnimeAvailable) return;

        const submitBtn = document.querySelector('.btn-register-word');
        submitBtn.disabled = false;

        if (success) {
            // 성공 애니메이션
            anime({
                targets: submitBtn,
                scale: [0.95, 1.1, 1],
                opacity: 1,
                backgroundColor: '#149767', // 성공 색상(녹색)
                duration: 600,
                easing: 'easeOutElastic(1, .6)'
            });

            // 폼 성공 효과
            anime({
                targets: '.form-container',
                translateY: [0, -10],
                opacity: [1, 0.8],
                delay: 1000,
                duration: 500,
                easing: 'easeInOutQuad'
            });
        } else {
            // 실패 애니메이션
            anime({
                targets: submitBtn,
                scale: [0.95, 1],
                opacity: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });

            // 폼 흔들림 효과
            anime({
                targets: '.form-container',
                translateX: [0, -10, 10, -10, 10, 0],
                duration: 600,
                easing: 'easeInOutQuad'
            });
        }
    }

    /**
     * 페이지 나가기 애니메이션
     * @param {Function} callback - 애니메이션 완료 후 콜백
     */
    animateExit(callback) {
        if (!this.isAnimeAvailable) {
            if (callback) callback();
            return;
        }

        anime({
            targets: '.form-container',
            translateY: [0, 20],
            opacity: [1, 0],
            easing: 'easeInOutQuad',
            duration: 400,
            complete: callback
        });
    }
}

// 애플리케이션 초기화 및 시작
document.addEventListener('DOMContentLoaded', function () {
    const app = new WordRegistrationApp();
    app.initialize();
});