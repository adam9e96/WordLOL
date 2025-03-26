class WordRegistrationApp {
    constructor() {
        // API 기본 URL
        this.API_BASE_URL = '/api/v1/words';

        // 처리 상태 플래그
        this.isProcessing = false;

        // DOM 요소 캐싱
        this.elements = {
            form: document.getElementById('wordForm'),
            vocabulary: document.getElementById('vocabulary'),
            meaning: document.getElementById('meaning'),
            hint: document.getElementById('hint'),
            difficultyOptions: document.querySelectorAll('input[name="difficulty"]'),
            submitBtn: document.querySelector('.btn-register-word')
        };

        // 모듈 초기화
        this.uiManager = new UIManager();
        this.apiService = new ApiService(this.API_BASE_URL);
        this.animationManager = new AnimationManager();
    }

    /**
     * 애플리케이션 초기화
     */
    initialize() {
        // DOM이 완전히 로드된 후 초기 애니메이션 실행
        this.animationManager.animatePageLoad();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 입력 필드에 초점 맞추기
        this.elements.vocabulary.focus();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 단어 등록 폼 제출 이벤트
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));

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
     * validation-s.js 모듈과 기존 updateFieldStatus 메서드 활용
     */
    setupValidationListeners() {
        // 초기 상태에서는 오류 메시지 숨기기
        document.querySelectorAll('.input-error-feedback').forEach(el => {
            el.style.display = 'none';
        });

        // 영단어 입력 필드 유효성 검사
        this.elements.vocabulary.addEventListener('blur', (e) => {
            const result = window.ValidationService.validateVocabulary(e.target.value);
            this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
        });

        this.elements.vocabulary.addEventListener('input', (e) => {
            if (e.target.value.trim() !== '') {
                const result = window.ValidationService.validateVocabulary(e.target.value);
                this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
            } else {
                this.uiManager.updateFieldStatus(e.target, null);
            }
        });

        // 의미 입력 필드 유효성 검사
        this.elements.meaning.addEventListener('blur', (e) => {
            const result = window.ValidationService.validateMeaning(e.target.value);
            this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
        });

        this.elements.meaning.addEventListener('input', (e) => {
            if (e.target.value.trim() !== '') {
                const result = window.ValidationService.validateMeaning(e.target.value);
                this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
            } else {
                this.uiManager.updateFieldStatus(e.target, null);
            }
        });

        // 힌트 입력 필드 유효성 검사
        this.elements.hint.addEventListener('blur', (e) => {
            const result = window.ValidationService.validateHint(e.target.value);
            this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
        });

        this.elements.hint.addEventListener('input', (e) => {
            if (e.target.value.trim() !== '') {
                const result = window.ValidationService.validateHint(e.target.value);
                this.uiManager.updateFieldStatus(e.target, result.isValid, result.message);
            } else {
                this.uiManager.updateFieldStatus(e.target, null);
            }
        });

        // 난이도 변경 시 유효성 검사
        this.elements.difficultyOptions.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const result = window.ValidationService.validateDifficulty(e.target.value);
                // 난이도는 라디오 버튼 그룹 전체가 컨테이너이므로 다르게 처리
                const difficultyContainer = e.target.closest('.difficulty-options');
                if (difficultyContainer) {
                    difficultyContainer.classList.toggle('is-invalid', !result.isValid);

                    const feedback = difficultyContainer.querySelector('.input-error-feedback');
                    if (feedback) {
                        feedback.textContent = result.message;
                        feedback.style.display = !result.isValid ? 'block' : 'none';
                    }
                }
            });
        });
    }

    /**
     * 폼 제출 처리
     * @param {Event} e - 제출 이벤트
     */
    async handleSubmit(e) {
        e.preventDefault();

        if (this.isProcessing) return;

        // 폼 데이터 수집
        const wordData = {
            vocabulary: this.elements.vocabulary.value.trim(),
            meaning: this.elements.meaning.value.trim(),
            hint: this.elements.hint.value.trim(),
            difficulty: parseInt(
                document.querySelector('input[name="difficulty"]:checked')?.value || 3
            )
        };

        try {
            this.isProcessing = true;
            this.animationManager.animateSubmitStart();

            // 전체 폼 유효성 검사 (중복 포함)
            const isValid = await window.validateWordForm(wordData, {
                showToast: true,
                checkDuplicate: async (vocabulary) => {
                    return await this.apiService.checkDuplicate(vocabulary);
                }
            });

            // 유효성 검사 실패 시 처리
            if (!isValid) {
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
            // 에러 토스트 메시지 표시
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
 * API 서비스 클래스
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
 * UI 관리 클래스
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
        if (!formGroup) return;

        // 피드백 요소 찾기
        const feedback = formGroup.querySelector('.input-error-feedback');

        // 유효성 아이콘 요소 찾기 또는 생성
        let validIcon = formGroup.querySelector('.valid-feedback-icon');
        if (!validIcon) {
            validIcon = document.createElement('div');
            validIcon.className = 'valid-feedback-icon';
            validIcon.style.position = 'absolute';
            validIcon.style.right = '10px';
            validIcon.style.top = '50%';
            validIcon.style.transform = 'translateY(-50%)';
            validIcon.style.display = 'none';
            validIcon.innerHTML = '<i class="bi bi-check-circle-fill text-success fs-5"></i>';

            // 입력 필드의 부모 요소에 position-relative 추가하고 아이콘 추가
            const inputWrapper = element.parentElement;
            if (inputWrapper) {
                if (!inputWrapper.classList.contains('position-relative')) {
                    inputWrapper.style.position = 'relative';
                }
                inputWrapper.appendChild(validIcon);
            }
        }

        // 초기 상태(null)인 경우 모든 클래스 제거
        if (isValid === null) {
            element.classList.remove('is-valid', 'is-invalid');
            validIcon.style.display = 'none';
            if (feedback) {
                feedback.style.display = 'none';
            }
            return;
        }

        // 유효성 여부에 따라 클래스 토글
        element.classList.toggle('is-valid', isValid);
        element.classList.toggle('is-invalid', !isValid);

        // 유효성 아이콘 토글
        validIcon.style.display = isValid ? 'block' : 'none';

        // 피드백 메시지 업데이트
        if (feedback) {
            feedback.textContent = message;
            feedback.style.display = !isValid && message ? 'block' : 'none';
        }
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

document.addEventListener('DOMContentLoaded', function () {
    const app = new WordRegistrationApp();
    app.initialize();
});